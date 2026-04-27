# Road Sense: XTHON Pitch Deck Script

Here is the content tailored **exactly** to the 14 slides found in the "XTHON Presentation Template .pptx" file.

---

## Slide 1 & 2: Title 
**Slide Text:**
*   **Project Name:** Road Sense
*   **Subtitle:** Transforming City Fleets into Smart Infrastructure Sensors
*   **Tagline:** Proactive road maintenance powered by Edge AI and IoT.

**Speaker Notes:**
> "Good morning judges and attendees. We are presenting 'Road Sense'—a project dedicated to transforming everyday vehicles into a smart, moving sensor network to proactively monitor our city's road infrastructure."

---

## Slide 3: Problem Statement
**Slide Text:**
*   **The Issue:** Reactive road maintenance is too late, too slow, and too expensive.
*   **Data/Stats:** 
    *   Cities rely on manual audits or citizen complaints (which occur *after* damage is done).
    *   Undetected potholes and cracks cause severe vehicle damage and increase traffic accidents.
    *   Traditional specialized scanning vehicles (ARAN/LiDAR) are prohibitively expensive for city-wide daily coverage.

**Speaker Notes:**
> "Currently, cities manage roads reactively. They wait for a citizen to complain or a car to get damaged before fixing a pothole. Manual audits are slow and expensive. This reactive approach costs millions and makes our streets unsafe."

---

## Slide 4: Innovation Overview
**Slide Text:**
*   **Our Idea:** Crowdsourced Infrastructure Monitoring using low-cost Edge AI sensors (ESP32 + Accelerometers) attached to existing public transport fleets.
*   **Differentiation:** 
    *   **Others:** Expensive, specialized scanning trucks (SAR 3.75 million/vehicle) used once a year.
    *   **Road Sense:** Ultra low-cost (~SAR 75) trigger units running continuous, daily scans utilizing vehicles (buses/taxis) and dashcams already on the road.

**Speaker Notes:**
> "Road Sense replaces expensive, infrequent scanning trucks with ultra-low-cost IoT trigger units. By attaching these 75-Riyal sensors to existing bus and taxi fleets and reusing their built-in dashcams, we achieve continuous, daily scanning of the entire city at a fraction of the cost."

---

## Slide 5: Target Audience
**Slide Text:**
*   **Primary:** Municipalities & City Maintenance Authorities (Amanat).
    *   *Needs:* Cost-effective, real-time data to prioritize road repairs efficiently.
*   **Secondary:** Everyday Citizens & Drivers.
    *   *Needs:* Safer roads and fewer vehicle damages from hidden potholes.

**Speaker Notes:**
> "Our primary users are city municipalities, like Amanat, who desperately need cost-effective, real-time data to prioritize their repair crews. Ultimately, solving this benefits every citizen and driver who wants safer, smoother commutes."

---

## Slide 6: Value Proposition
**Slide Text:**
*   **Unique Value:** Transitioning cities from *reactive* repairs to *predictive* maintenance.
*   **Benefits:**
    *   **Live Dashboard:** Real-time heatmap of road degradation.
    *   **Cost Savings:** Detects minor anomalies (SAR 4-11/m crack seal) before they become major, expensive failures (SAR 100-200/m2 pothole).
    *   **Automated Severity:** Edge AI filters out normal bumps and strictly classifies true road hazards.

**Speaker Notes:**
> "Our unique value proposition is moving cities from reactive to predictive maintenance. We provide a live dashboard that automatically classifies the severity of road defects, allowing cities to fix a cheap crack today rather than an expensive pothole next month."

---

## Slide 7: Prototype vs Deployment Architecture
**Slide Text:**
*   **Current Prototype:** ESP32-C3 & MPU6050 (Proof of concept for vibration detection and Wi-Fi dashboard sync. *No GPS/Dashcam*).
*   **Production Deployment:** Low-cost Vibration Trigger PCB (ESP32 + Buck Converter) powered from vehicle fuse box.
*   **Fleet Integration:** Triggers the fleet's *existing* dashcam to take 1 snapshot + GPS tag.
*   **Tech Stack:** 
    *   *Hardware:* Arduino C++ Edge AI (sqrt(ax²+ay²+az²))
    *   *Backend:* Node.js, Express.js, WebSocket, Render hosting
    *   *Frontend:* HTML5, Vanilla CSS, JS, Leaflet maps, ApexCharts

**Speaker Notes:**
> "For our prototype, we built the core vibration edge-detection node. However, in our real deployment architecture, we don't install new expensive GPS or camera modules. We simply install a 75 Riyal vibration trigger into the fuse box, which tells the fleet's *existing* dashcam to snap a picture and grab the GPS coordinates when a severe impact happens."

---

## Slide 8: Market Viability
**Slide Text:**
*   **Market Size:** Smart City Infrastructure & IoT Monitoring.
*   **National Impact:** KSA allocated SAR 42 billion to infrastructure and transportation in 2025.
*   **Potential:** Every growing metropolis worldwide faces road degradation. The push for Smart Cities (like Vision 2030) demands automated, data-driven municipal management.

**Speaker Notes:**
> "The market viability is massive. Under initiatives like Vision 2030, Saudi Arabia has allocated 42 billion Riyals for infrastructure this year alone. Automated infrastructure monitoring is a core pillar of transforming our transportation networks."

---

## Slide 9: Business Model
**Slide Text:**
*   **B2G SaaS (Software as a Service):** 
    *   Monthly subscription for municipalities. Cloud costs remain incredibly low because the system only uploads single snapshots via depot Wi-Fi (no heavy video/LTE).
*   **Hardware Sales:** 
    *   ~SAR 75/unit bulk cost × 5,000 buses = SAR 375,000 for full city deployment.
*   **B2B Data Monetization:** 
    *   Licensing real-time road quality APIs to logistics fleets and delivery services.

**Speaker Notes:**
> "Our revenue comes primarily from a B2G SaaS model. Because we only upload single snapshots when the bus returns to the depot Wi-Fi, our cloud costs are incredibly low. The hardware to cover an entire 5,000-vehicle city fleet is just 375,000 Riyals."

---

## Slide 10: Feasibility
**Slide Text:**
*   **Resources Required:** Off-the-shelf ESP32-C3 modules, MPU6050 sensors, and 12V-to-5V buck converters.
*   **Scalability:** Highly practical. 
    *   Zero new vehicles needed. 
    *   Reuses existing fleet dashcams and telematics.
    *   Requires no active cellular LTE subscriptions per vehicle (uploads via Depot Wi-Fi).

**Speaker Notes:**
> "Implementation is highly feasible. We use off-the-shelf, globally available components. Because we are mounting on existing public transport, reusing their built-in dashcams, and uploading over Depot Wi-Fi, there are zero monthly cellular costs per vehicle."

---

## Slide 11: Challenges & Risks
**Slide Text:**
*   **Challenge:** Hardware durability (heat, extreme vehicle vibration) and safe vehicle power.
    *   *Mitigation:* Ruggedized enclosures and stepping down power safely via fuse taps and 12V/24V buck converters.
*   **Challenge:** False Positives (e.g., speed bumps).
    *   *Mitigation:* Edge waveform analysis, cooldown timers, and the dashcam snapshot allows operators to visually verify defects before dispatching a crew.

**Speaker Notes:**
> "Our main challenges involve hardware durability and data accuracy. We mitigate power and vibration issues with safe fuse-box buck converters. To prevent false positives, we use edge acceleration thresholds, and operators can visually verify the triggered snapshot before sending a repair crew."

---

## Slide 12: Impact & Sustainability
**Slide Text:**
*   **Short-term Impact:** Immediate mapping of critical road hazards for rapid repair, reducing current traffic accidents.
*   **Long-term Sustainability:** Prolongs the overall lifespan of city roads (saving millions in asphalt repaving) and reduces the carbon footprint associated with major road reconstruction.
*   **Dashboard Impact:** AI schedules repairs before roads reach the critical PCI < 50.3 threshold.

**Speaker Notes:**
> "In the short term, we provide immediate mapping of critical hazards. Long-term, by enabling predictive maintenance, we drastically prolong the lifespan of the city's asphalt, saving millions and keeping our roads above the critical Pavement Condition Index thresholds."

---

## Slide 13: Next Step (Future Improvements)
**Slide Text:**
*   **PCI Tracking:** Track Pavement Condition Index in real-time to intervene before PCI drops below 50.3.
*   **Overlay Timing:** Automated recommendations for protective asphalt overlay during the optimal Year-9 window.
*   **System Integration:** Direct API hooks into municipal ticketing systems (e.g., Balady) for zero-touch automated repair dispatch.

**Speaker Notes:**
> "Our immediate next steps include deep integration with engineering standards: tracking live PCI scores, and automatically recommending asphalt overlays during the critical 9th-year window. Eventually, we'll hook directly into municipal systems for zero-touch automated repair dispatch."

---

## Slide 14: Conclusion
**Slide Text:**
*   **Innovators’ names:** *(Add your names here)*
*   **Institution:** *(Add your institution/team name here)*
*   **Final Word:** Let's build smarter, safer roads together. Thank you.

**Speaker Notes:**
> "Thank you for your time. We are Road Sense, and we believe that the smartest cities are the ones that can feel and heal their own infrastructure. We are open for your questions."
