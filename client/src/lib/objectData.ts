import { ObjectData, ObjectType } from "@shared/schema";

export const OBJECT_DATABASE: Record<string, ObjectData> = {
  "graffiti": {
    type: "graffiti" as ObjectType,
    name: "Graffiti",
    icon: "🎨",
    accentColor: "hsl(280, 70%, 50%)",
    greeting: "Graffiti detected. See removal and reporting guidelines below.",
    quickActions: [
      {
        id: "disposal",
        label: "What do I do?",
        response: "Document with photos from multiple angles. Note surface type (brick, metal, concrete). For offensive content, prioritize for immediate removal. Use appropriate cleaning method based on surface and paint type."
      },
      {
        id: "location",
        label: "Report & document",
        response: "Mark GPS location in app. Take photos including context shots. Note property type (public/private). Complete incident report. Estimate size in square meters. Check for gang tags or hate symbols."
      },
      {
        id: "safety",
        label: "Removal methods",
        response: "Brick/concrete: Use graffiti remover and pressure washer. Metal: Solvent-based cleaner. Painted surfaces: May require repainting. Always wear protective gear and ensure proper ventilation."
      },
      {
        id: "priority",
        label: "Priority levels",
        response: "Priority 1 (24hrs): Offensive/hate symbols, schools, main roads. Priority 2 (48hrs): Commercial areas, parks. Priority 3 (7 days): Low-visibility areas. Document all with before/after photos."
      }
    ],
    responses: {
      "repeat": "Repeat offense location: Install CCTV if budget allows. Increase patrol frequency. Apply anti-graffiti coating after removal. Notify local police.",
      "private": "Private property: Leave notice for owner with removal instructions. Offer council assistance program details. Follow up in 14 days if not removed.",
      "heritage": "Heritage/listed building: Do not clean. Contact heritage officer immediately. Specialized restoration may be required. Document thoroughly."
    }
  },
  "syringe": {
    type: "syringe",
    name: "Syringe",
    icon: "💉",
    accentColor: "hsl(24, 80%, 50%)",
    greeting: "Syringe detected. Important safety information below.",
    quickActions: [
      {
        id: "disposal",
        label: "What do I do?",
        response: "DO NOT TOUCH with bare hands. Use approved sharps pickup tool. Place in designated sharps container immediately. Never attempt to recap or bend the needle."
      },
      {
        id: "safety",
        label: "Safety protocol",
        response: "CRITICAL: Always wear puncture-resistant gloves. Use tongs or sharps pickup tool. Maintain safe distance. If pricked, seek immediate medical attention and report incident to supervisor."
      },
      {
        id: "container",
        label: "Container full",
        response: "When sharps container is 3/4 full, seal and label it. Call biohazard disposal service (1800-SHARPS). Do not compact or shake container. Store in secure location until pickup."
      },
      {
        id: "location",
        label: "Report location",
        response: "Mark GPS coordinates in app. Take photo from safe distance. Place warning cone if in public area. Complete incident report form before leaving site."
      }
    ],
    responses: {
      "emergency": "Needle stick injury: Wash wound immediately. Squeeze to promote bleeding. Seek medical attention within 2 hours. Report to supervisor and complete incident form.",
      "public": "Found in public area: Secure perimeter. Never let children or public approach. Use proper collection tools. Complete full documentation.",
      "multiple": "Multiple syringes: Call for backup. Establish safe zone. Use systematic collection method. Consider requesting police presence if necessary."
    }
  },
  "dog-poop": {
    type: "dog-poop",
    name: "Dog Waste",
    icon: "🐕",
    accentColor: "hsl(30, 60%, 45%)",
    greeting: "Dog waste identified. See disposal guidelines below.",
    quickActions: [
      {
        id: "disposal",
        label: "What do I do?",
        response: "Use long-handled scoop and bag. Dispose in general waste bin or designated dog waste bin. Always wear gloves. Clean tools with disinfectant after use."
      },
      {
        id: "location",
        label: "Report issue",
        response: "Document location with GPS and photo. If on public property, collect and dispose. If on private property, leave notice for owner. Repeat offenses should be reported to compliance team."
      },
      {
        id: "safety",
        label: "Health & safety",
        response: "Dog waste carries harmful bacteria. Always wear gloves. Wash hands thoroughly after handling. If waste is in contact with skin, wash immediately with soap and water."
      },
      {
        id: "bins",
        label: "Dog waste bins",
        response: "Dog waste bins should be emptied twice weekly. Use separate bags for dog waste. Check for bag supply and report if low. Clean bin exterior monthly."
      }
    ],
    responses: {
      "park": "In parks: Check designated dog areas first. Empty dog waste bins before general bins. Report areas with excessive waste to parks department.",
      "complaint": "Resident complaint: Document location and frequency. Issue warning notice to property owner. Schedule follow-up inspection in 7 days.",
      "education": "Leave educational flyer about responsible pet ownership. Include information about free bag dispensers. List nearby designated dog waste bins."
    }
  },
  "circle-t-logo": {
    type: "circle-t-logo",
    name: "Circle T Logo",
    icon: "🎉",
    accentColor: "hsl(200, 80%, 45%)",
    greeting: "🎉 Circle T Logo detected! You found the easter egg!",
    quickActions: [
      {
        id: "celebrate",
        label: "What is this?",
        response: "You've discovered a special easter egg! The Circle T logo represents the Council's commitment to innovation and technology. Thanks for testing the AR detection system!"
      },
      {
        id: "info",
        label: "About the app",
        response: "This AR Assistant uses advanced AI to help council workers identify and handle waste bins, syringes, dog waste, and graffiti. Point your camera at different objects to try it out!"
      }
    ],
    responses: {
      "celebration": "Confetti time! 🎊 Keep exploring the app to discover more features.",
      "team": "Built with innovation and care by the Circle T team. Happy detecting!"
    }
  }
};

export function getObjectByQRCode(qrCode: string): ObjectData | null {
  const objectType = qrCode.toLowerCase().replace(/[^a-z-]/g, "");
  return OBJECT_DATABASE[objectType] || null;
}
