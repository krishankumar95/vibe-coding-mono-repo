import React from "react";
import { Badge } from "@/components/ui/badge";

interface CommonHexCodesProps {
  setHexCode: (value: string) => void;
}

// Relay control hex codes
const relayCodes = [
  { label: "Relay1 ON", code: "A0 01 01 A2" },
  { label: "Relay1 OFF", code: "A0 01 00 A1" },
  { label: "Relay2 ON", code: "A0 02 01 A3" },
  { label: "Relay2 OFF", code: "A0 02 00 A2" },
];

// Some common hex commands that might be useful
const commonCodes = [
  { label: "Ping", code: "FF 00 00" },
  { label: "Status", code: "FF 01 00" },
  { label: "Reset", code: "FF 02 00" },
  { label: "On", code: "01 01 01" },
  { label: "Off", code: "01 00 00" },
  { label: "Toggle", code: "01 02 00" },
];

const CommonHexCodes: React.FC<CommonHexCodesProps> = ({ setHexCode }) => {
  return (
    <div className="space-y-4">
      {/* Relay Control Commands */}
      <div>
        <div className="text-sm font-medium mb-2">Relay Control</div>
        <div className="flex flex-wrap gap-2">
          {relayCodes.map((code, index) => (
            <Badge
              key={`relay-${index}`}
              variant="outline"
              className="code-badge cursor-pointer hover:bg-secondary/70"
              onClick={() => setHexCode(code.code)}
            >
              <span className="mr-1 text-muted-foreground">{code.label}:</span>
              <span className="hexcode">{code.code}</span>
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Common Commands */}
      <div>
        <div className="text-sm font-medium mb-2">Common Commands</div>
        <div className="flex flex-wrap gap-2">
          {commonCodes.map((code, index) => (
            <Badge
              key={`common-${index}`}
              variant="outline"
              className="code-badge cursor-pointer hover:bg-primary/10"
              onClick={() => setHexCode(code.code)}
            >
              <span className="mr-1 text-muted-foreground">{code.label}:</span>
              <span className="hexcode">{code.code}</span>
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        Click on a command to use it
      </div>
    </div>
  );
};

export default CommonHexCodes;
