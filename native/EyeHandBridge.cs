using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Collections.Generic;

namespace EyeHandNative {
    class Program {
        [StructLayout(LayoutKind.Sequential)]
        public struct POINT {
            public int X;
            public int Y;
        }

        [DllImport("user32.dll")]
        public static extern bool SetCursorPos(int X, int Y);

        [DllImport("user32.dll")]
        public static extern bool GetCursorPos(out POINT lpPoint);

        [DllImport("user32.dll")]
        public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);

        [DllImport("user32.dll")]
        public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

        [DllImport("user32.dll")]
        public static extern short GetAsyncKeyState(int vKey);

        [DllImport("user32.dll")]
        public static extern int GetSystemMetrics(int nIndex);

        // Mouse flags
        const uint MOUSEEVENTF_MOVE = 0x0001;
        const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        const uint MOUSEEVENTF_LEFTUP = 0x0004;
        const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
        const uint MOUSEEVENTF_RIGHTUP = 0x0010;
        const uint MOUSEEVENTF_MIDDLEDOWN = 0x0020;
        const uint MOUSEEVENTF_MIDDLEUP = 0x0040;
        const uint MOUSEEVENTF_WHEEL = 0x0800;

        // Key flags
        const uint KEYEVENTF_EXTENDEDKEY = 0x0001;
        const uint KEYEVENTF_KEYUP = 0x0002;

        // Metrics
        const int SM_CXSCREEN = 0;
        const int SM_CYSCREEN = 1;
        const int SM_XVIRTUALSCREEN = 76;
        const int SM_YVIRTUALSCREEN = 77;
        const int SM_CXVIRTUALSCREEN = 78;
        const int SM_CYVIRTUALSCREEN = 79;

        // Virtual Keys
        const int VK_ESCAPE = 0x1B;
        const int VK_RETURN = 0x0D;
        const int VK_SPACE = 0x20;
        const int VK_BACK = 0x08;
        const int VK_TAB = 0x09;
        const int VK_LEFT = 0x25;
        const int VK_UP = 0x26;
        const int VK_RIGHT = 0x27;
        const int VK_DOWN = 0x28;
        const int VK_CONTROL = 0x11;
        const int VK_MENU = 0x12; // Alt
        const int VK_SHIFT = 0x10;

        static bool isEmergencyStopped = false;
        static bool isSystemControlEnabled = true;
        static HttpListener listener;
        static int port = 48920;

        static void Main(string[] args) {
            Console.Title = "EyeHand Native System Input Bridge (Win32 SendInput)";
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("======================================================");
            Console.WriteLine(" EyeHand Native System Control Bridge v1.0");
            Console.WriteLine(" Target: Windows Win32 User32 SendInput API");
            Console.WriteLine(" Local Port: http://127.0.0.1:" + port + "/");
            Console.WriteLine(" Emergency Stop: Press ESC anytime to pause all input");
            Console.WriteLine("======================================================");
            Console.ResetColor();

            // Background thread to monitor global physical ESC key
            Thread escThread = new Thread(MonitorEmergencyEscapeKey);
            escThread.IsBackground = true;
            escThread.Start();

            // Start HTTP Server
            try {
                listener = new HttpListener();
                listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                listener.Prefixes.Add("http://localhost:" + port + "/");
                listener.Start();
                Console.WriteLine("[Bridge Ready] Listening for control events from EyeHand UI...");
            } catch (Exception ex) {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("Could not bind localhost prefix without admin, falling back to 127.0.0.1 only: " + ex.Message);
                Console.ResetColor();
                listener = new HttpListener();
                listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                listener.Start();
                Console.WriteLine("[Bridge Ready] Listening on http://127.0.0.1:" + port + "/");
            }

            while (true) {
                try {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((state) => HandleRequest((HttpListenerContext)state), context);
                } catch (Exception ex) {
                    if (!listener.IsListening) break;
                    Console.WriteLine("[Server Error] " + ex.Message);
                }
            }
        }

        static void MonitorEmergencyEscapeKey() {
            while (true) {
                // Check if physical ESC is pressed down
                if ((GetAsyncKeyState(VK_ESCAPE) & 0x8000) != 0) {
                    if (!isEmergencyStopped) {
                        isEmergencyStopped = true;
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("\n[EMERGENCY STOP TRIGGERED VIA PHYSICAL ESC KEY] Control Paused!");
                        Console.ResetColor();
                        // Release mouse buttons if held
                        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                        mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
                    }
                }
                Thread.Sleep(50);
            }
        }

        static void HandleRequest(HttpListenerContext context) {
            HttpListenerRequest req = context.Request;
            HttpListenerResponse res = context.Response;

            // Enable CORS for browser / electron UI
            res.AddHeader("Access-Control-Allow-Origin", "*");
            res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.AddHeader("Access-Control-Allow-Headers", "Content-Type, X-EyeHand-Token");

            if (req.HttpMethod == "OPTIONS") {
                res.StatusCode = 204;
                res.Close();
                return;
            }

            string path = req.Url.AbsolutePath.ToLowerInvariant();

            try {
                if (path == "/api/status" || path == "/") {
                    int screenW = GetSystemMetrics(SM_CXSCREEN);
                    int screenH = GetSystemMetrics(SM_CYSCREEN);
                    int virtX = GetSystemMetrics(SM_XVIRTUALSCREEN);
                    int virtY = GetSystemMetrics(SM_YVIRTUALSCREEN);
                    int virtW = GetSystemMetrics(SM_CXVIRTUALSCREEN);
                    int virtH = GetSystemMetrics(SM_CYVIRTUALSCREEN);

                    POINT cur;
                    GetCursorPos(out cur);

                    string json = string.Format(
                        "{{\"status\":\"online\",\"emergencyStopped\":{0},\"systemControlEnabled\":{1},\"cursor\":{{\"x\":{2},\"y\":{3}}},\"primary\":{{\"width\":{4},\"height\":{5}}},\"virtualScreen\":{{\"x\":{6},\"y\":{7},\"width\":{8},\"height\":{9}}}}}",
                        isEmergencyStopped ? "true" : "false",
                        isSystemControlEnabled ? "true" : "false",
                        cur.X, cur.Y,
                        screenW, screenH,
                        virtX, virtY, virtW > 0 ? virtW : screenW, virtH > 0 ? virtH : screenH
                    );

                    byte[] buffer = Encoding.UTF8.GetBytes(json);
                    res.ContentType = "application/json";
                    res.ContentLength64 = buffer.Length;
                    res.OutputStream.Write(buffer, 0, buffer.Length);
                    res.Close();
                    return;
                }

                if (path == "/api/action" && req.HttpMethod == "POST") {
                    string body;
                    using (var reader = new StreamReader(req.InputStream, req.ContentEncoding)) {
                        body = reader.ReadToEnd();
                    }

                    string responseJson = ProcessAction(body);
                    byte[] buffer = Encoding.UTF8.GetBytes(responseJson);
                    res.ContentType = "application/json";
                    res.ContentLength64 = buffer.Length;
                    res.OutputStream.Write(buffer, 0, buffer.Length);
                    res.Close();
                    return;
                }

                res.StatusCode = 404;
                res.Close();
            } catch (Exception ex) {
                res.StatusCode = 500;
                byte[] err = Encoding.UTF8.GetBytes("{\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
                res.OutputStream.Write(err, 0, err.Length);
                res.Close();
            }
        }

        static string ProcessAction(string json) {
            // Simple robust JSON key-value extraction for C# 5 compatibility without external NuGet
            string action = GetJsonString(json, "action");

            if (action == "emergency_stop") {
                isEmergencyStopped = true;
                mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
                return "{\"success\":true,\"emergencyStopped\":true}";
            }

            if (action == "resume") {
                isEmergencyStopped = false;
                return "{\"success\":true,\"emergencyStopped\":false}";
            }

            if (action == "toggle_system_control") {
                bool enabled = GetJsonBool(json, "enabled");
                isSystemControlEnabled = enabled;
                return "{\"success\":true,\"systemControlEnabled\":" + (isSystemControlEnabled ? "true" : "false") + "}";
            }

            if (isEmergencyStopped || !isSystemControlEnabled) {
                return "{\"success\":false,\"reason\":\"Control paused or emergency stopped\"}";
            }

            int screenW = GetSystemMetrics(SM_CXSCREEN);
            int screenH = GetSystemMetrics(SM_CYSCREEN);

            switch (action) {
                case "move": {
                    int x = GetJsonInt(json, "x");
                    int y = GetJsonInt(json, "y");
                    double nx = GetJsonDouble(json, "nx", -1);
                    double ny = GetJsonDouble(json, "ny", -1);

                    if (nx >= 0 && ny >= 0) {
                        x = (int)(nx * screenW);
                        y = (int)(ny * screenH);
                    }

                    // Bounds clamp
                    if (x < 0) x = 0;
                    if (y < 0) y = 0;
                    if (x >= screenW) x = screenW - 1;
                    if (y >= screenH) y = screenH - 1;

                    SetCursorPos(x, y);
                    return "{\"success\":true}";
                }

                case "click": {
                    string button = GetJsonString(json, "button");
                    if (string.IsNullOrEmpty(button)) button = "left";

                    if (button == "right") {
                        mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
                        Thread.Sleep(15);
                        mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
                    } else if (button == "double") {
                        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                        Thread.Sleep(60);
                        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                    } else {
                        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                        Thread.Sleep(15);
                        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                    }
                    return "{\"success\":true}";
                }

                case "down": {
                    string button = GetJsonString(json, "button");
                    if (button == "right") {
                        mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
                    } else {
                        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                    }
                    return "{\"success\":true}";
                }

                case "up": {
                    string button = GetJsonString(json, "button");
                    if (button == "right") {
                        mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
                    } else {
                        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                    }
                    return "{\"success\":true}";
                }

                case "scroll": {
                    int delta = GetJsonInt(json, "delta");
                    if (delta == 0) delta = 120;
                    mouse_event(MOUSEEVENTF_WHEEL, 0, 0, (uint)delta, 0);
                    return "{\"success\":true}";
                }

                case "key": {
                    string key = GetJsonString(json, "key").ToLowerInvariant();
                    byte vk = 0;
                    switch (key) {
                        case "enter": vk = (byte)VK_RETURN; break;
                        case "escape": vk = (byte)VK_ESCAPE; break;
                        case "tab": vk = (byte)VK_TAB; break;
                        case "space": vk = (byte)VK_SPACE; break;
                        case "backspace": vk = (byte)VK_BACK; break;
                        case "left": vk = (byte)VK_LEFT; break;
                        case "up": vk = (byte)VK_UP; break;
                        case "right": vk = (byte)VK_RIGHT; break;
                        case "down": vk = (byte)VK_DOWN; break;
                        case "copy":
                            // Ctrl + C
                            keybd_event((byte)VK_CONTROL, 0, 0, 0);
                            keybd_event((byte)'C', 0, 0, 0);
                            Thread.Sleep(20);
                            keybd_event((byte)'C', 0, KEYEVENTF_KEYUP, 0);
                            keybd_event((byte)VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
                            return "{\"success\":true}";
                        case "paste":
                            // Ctrl + V
                            keybd_event((byte)VK_CONTROL, 0, 0, 0);
                            keybd_event((byte)'V', 0, 0, 0);
                            Thread.Sleep(20);
                            keybd_event((byte)'V', 0, KEYEVENTF_KEYUP, 0);
                            keybd_event((byte)VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
                            return "{\"success\":true}";
                        default:
                            if (key.Length == 1) {
                                char c = key.ToUpperInvariant()[0];
                                if (c >= 'A' && c <= 'Z' || c >= '0' && c <= '9') {
                                    vk = (byte)c;
                                }
                            }
                            break;
                    }

                    if (vk != 0) {
                        keybd_event(vk, 0, 0, 0);
                        Thread.Sleep(20);
                        keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);
                        return "{\"success\":true}";
                    }
                    return "{\"success\":false,\"error\":\"Unsupported key\"}";
                }

                case "app": {
                    string target = GetJsonString(json, "target").ToLowerInvariant();
                    // Secure whitelist launcher
                    if (target == "browser") {
                        Process.Start("https://www.google.com");
                    } else if (target == "explorer") {
                        Process.Start("explorer.exe");
                    } else if (target == "calculator") {
                        Process.Start("calc.exe");
                    } else if (target == "settings") {
                        Process.Start("ms-settings:");
                    } else {
                        return "{\"success\":false,\"error\":\"Target application not in secure whitelist\"}";
                    }
                    return "{\"success\":true}";
                }

                default:
                    return "{\"success\":false,\"error\":\"Unknown action: " + action + "\"}";
            }
        }

        static string GetJsonString(string json, string key) {
            string search = "\"" + key + "\":";
            int idx = json.IndexOf(search);
            if (idx < 0) return "";
            int start = idx + search.Length;
            while (start < json.Length && (json[start] == ' ' || json[start] == '\"')) start++;
            int end = start;
            while (end < json.Length && json[end] != '\"' && json[end] != ',' && json[end] != '}') end++;
            return json.Substring(start, end - start).Trim();
        }

        static int GetJsonInt(string json, string key) {
            string str = GetJsonString(json, key);
            int val;
            if (int.TryParse(str, out val)) return val;
            return 0;
        }

        static double GetJsonDouble(string json, string key, double defVal = 0) {
            string str = GetJsonString(json, key);
            double val;
            if (double.TryParse(str, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out val)) return val;
            return defVal;
        }

        static bool GetJsonBool(string json, string key) {
            string str = GetJsonString(json, key).ToLowerInvariant();
            return str == "true" || str == "1";
        }
    }
}
