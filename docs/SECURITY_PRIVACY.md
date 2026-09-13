# Security & Privacy Policy: EyeHand

## 1. Local Processing Guarantee
* **Camera Invariant:** EyeHand operates exclusively on local webcam video frames accessed through the browser's `navigator.mediaDevices.getUserMedia` API.
* **No Server Uploads:** Camera frames are consumed directly by MediaPipe WebAssembly and WebGL shaders in memory. Frames are never encoded, streamed, or uploaded to any remote server or cloud service.
* **No Biometric Storage:** EyeHand does not save face geometry, iris templates, or biometric identity records. Calibration data stored in `localStorage` consists strictly of 8 abstract numerical regression coefficients.

---

## 2. Accidental Action Prevention & Safety Interlocks

1. **Simulation Mode Default:** The application defaults to simulation mode with an in-app virtual cursor. System-wide Windows control is disabled until explicitly enabled and confirmed by the user.
2. **Emergency Stop (ESC):**
   * Pressing the physical **ESC** key on the keyboard immediately halts all mouse movement, click dispatch, and input simulation.
   * Monitored at both browser and native levels (`GetAsyncKeyState(VK_ESCAPE)`).
3. **Tracking Loss Protection:** If the user moves away from the camera or the face landmark confidence drops below 0.65, control is paused immediately with the notice: *"Tracking lost — control paused."*
4. **Multiple Face Safety:** If more than one person enters the camera frame, control is paused to prevent hijacking or accidental inputs: *"Multiple faces detected. Control paused for safety."*
5. **Action Cooldowns:** Enforced 300–500ms debounce between clicks prevents unintentional double-clicks.
6. **Command Whitelist:** Voice commands and application launching are strictly bound to an explicit whitelist (`browser`, `explorer`, `calculator`, `settings`). Arbitrary shell command execution is prohibited.
