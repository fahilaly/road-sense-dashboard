# Road Sense — 5-Minute XTHON Pitch Script

**Format:** Short, punchy bullet points designed for a rapid 5-minute presentation (~20 seconds per slide).

---

## Slide 1 & 2: Title / Cover
*   **Opening:** "Good morning. We are Road Sense."
*   **The Concept:** "We turn everyday city fleets into a smart sensor network."
*   **The Goal:** "Moving from reactive road repairs to proactive, AI-driven infrastructure maintenance."

## Slide 3: Problem Statement
*   **The Issue:** "Cities fix potholes *after* they form. This reactive approach is slow and incredibly expensive."
*   **The Cost:** "Delaying maintenance increases repair costs by over 1,000%."
*   **Current Tech Fails:** "Standard road-scanning trucks cost SAR 3.75 Million each. Cities can't afford to scan every street, every day."

## Slide 4: Innovation Overview
*   **The Solution:** "We don't buy new scanning trucks. We install ultra-low-cost IoT triggers on existing city buses and garbage trucks."
*   **Continuous Data:** "Instead of scanning a road once a year, our sensors map the entire city every single day."

## Slide 5: Target Audience
*   **Municipalities (Amanat):** "They need live data to prioritize their SAR 42B infrastructure budgets."
*   **Citizens:** "They need safer commutes, fewer accidents, and zero tire damage."

## Slide 6: Value Proposition
*   **Predictive Maintenance:** "We detect minor vibrations (early cracks) so the city can seal them for SAR 10 before they become a massive SAR 200 pothole."
*   **Visual Proof:** "Our system provides a real-time heatmap and a photo of the defect before a crew is ever dispatched."

## Slide 7: Prototype & Architecture (Core Mechanics)
*   **Proof of Concept:** "Our current prototype successfully proves vibration detection using an ESP32 and IMU."
*   **The Production Flow (How it works in the real world):**
    1.  ESP32 PCB detects an abnormal road impact.
    2.  It sends a trigger signal to the fleet's *existing* smart dashcam.
    3.  The dashcam captures ONE snapshot and tags the exact GPS time/location.
    4.  The photo is stored locally.
    5.  It uploads automatically when the bus returns to the Depot Wi-Fi.

## Slide 8: Market Viability
*   **The Budget:** "In 2025 alone, Saudi Arabia allocated SAR 42 Billion to infrastructure and transport."
*   **Vision 2030:** "The Kingdom aims to rank 6th globally in road quality. Road Sense is the real-time data engine required to hit that target."

## Slide 9: Business Model
*   **B2G SaaS:** "Municipalities pay a monthly dashboard subscription."
*   **Low Operating Cost:** "Because we upload via Depot Wi-Fi, our cellular data costs are practically zero."
*   **Hardware Scale:** "Deploying our SAR 75 trigger unit across an entire city fleet of 5,000 buses costs just SAR 375,000."

## Slide 10: Feasibility
*   **Standard Parts:** "We use globally available, off-the-shelf ESP32 and MPU6050 chips."
*   **Zero New Cameras/GPS:** "We leverage the expensive dashcams and GPS units the fleet *already* installed. We just add the brain."

## Slide 11: Challenges & Risks
*   **Risk 1: Power & Durability.** "Solved by using a rugged enclosure and a safe 12V-to-5V buck converter tapped directly to the fuse box."
*   **Risk 2: False Positives.** "Solved by the dashcam integration. If the sensor triggers on a speedbump, the operator sees the snapshot and ignores it. No wasted repair trucks."

## Slide 12: Impact & Sustainability
*   **Short Term:** "Immediate mapping of critical hazards to prevent traffic accidents today."
*   **Long Term:** "By catching defects early, we prolong the lifespan of the asphalt, saving millions and massively reducing the carbon footprint of heavy road reconstruction."

## Slide 13: Next Steps
*   **API Integration:** "Directly linking our dashboard to municipal ticketing systems (like Balady) for automated, zero-touch repair dispatch."
*   **AI Timelines:** "Using historical vibration data to predict exactly which year a street will need a full asphalt overlay."

## Slide 14: Conclusion
*   **Closing:** "Let's build the nervous system for our city's roads."
*   "Thank you. We are ready for your questions."
