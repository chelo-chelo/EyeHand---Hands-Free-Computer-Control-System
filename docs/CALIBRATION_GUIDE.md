# EyeHand 9-Point Calibration Guide

## Purpose
Webcam-based gaze estimation relies on extracting iris landmarks and facial pose. Because individual eye anatomy, monitor distances, and webcam tilt vary significantly, EyeHand implements a **9-Point Bivariate Calibration Wizard** that maps observed eye features into normalized screen pixel coordinates.

---

## The 9 Calibration Points

The screen is partitioned into a 3x3 reference coordinate grid:

```
[Top-Left: (15%, 15%)]       [Top-Center: (50%, 15%)]       [Top-Right: (85%, 15%)]

[Mid-Left: (15%, 50%)]       [Center:     (50%, 50%)]       [Mid-Right: (85%, 50%)]

[Bottom-Left:(15%, 85%)]     [Bottom-Center:(50%, 85%)]     [Bottom-Right:(85%, 85%)]
```

---

## Calibration Step-by-Step

1. **Camera Alignment:**
   * Sit approximately 50–70 cm from the display at eye level.
   * Ensure your face is illuminated from the front (avoid bright backlighting).
2. **Launch Calibration:**
   * Click **"Start Calibration"** in the top navigation or Calibration tab.
3. **Follow the Target:**
   * An animated cyan circular target appears sequentially at each of the 9 points.
   * Fixate your eyes steadily on the center dot while the circular timer completes (approx. 1.8 seconds per target).
   * Do not rapidly jerk your head; maintain a comfortable, natural posture.
4. **Review Calibration Quality:**
   * Upon completion, EyeHand evaluates residual error and gaze stability:
     * **Excellent (★★★★★):** Stability $\ge 88\%$, ready for high-precision cursor navigation.
     * **Good (★★★★☆):** Stability $74\% - 87\%$, suitable for general button and link navigation.
     * **Fair / Poor (★★★☆☆):** Stability $< 74\%$, recommend recalibrating with better front lighting and closer distance.
