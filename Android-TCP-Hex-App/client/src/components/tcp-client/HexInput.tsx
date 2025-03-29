import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Send, Loader2, RepeatIcon } from "lucide-react";
import { isValidHex } from "@/lib/validators";

interface HexInputProps {
  hexCode: string;
  setHexCode: (value: string) => void;
  handleSendHex: (repeatCount?: number) => void;
  connected: boolean;
  isLoading: boolean;
}

const HexInput: React.FC<HexInputProps> = ({
  hexCode,
  setHexCode,
  handleSendHex,
  connected,
  isLoading,
}) => {
  // State for repeat count
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [showRepeatOptions, setShowRepeatOptions] = useState<boolean>(false);
  
  // Transform input to valid hex format
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-hex characters and convert to uppercase
    const value = e.target.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    
    // Automatically add spaces every two characters for readability
    const formatted = value.split("").reduce((result, char, index) => {
      if (index > 0 && index % 2 === 0) {
        return result + " " + char;
      }
      return result + char;
    }, "");
    
    setHexCode(formatted);
  };

  // Handle repeat count changes
  const handleRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numValue = parseInt(value || "1", 10);
    // Limit to reasonable range (1-100)
    const limitedValue = Math.min(Math.max(numValue, 1), 100);
    setRepeatCount(limitedValue);
  };

  // Toggle repeat options visibility
  const toggleRepeatOptions = () => {
    setShowRepeatOptions(!showRepeatOptions);
  };

  // Handle send with repeat count
  const onSendHex = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSendHex(repeatCount);
  };

  // Validate if we can send
  const canSend = isValidHex(hexCode) && !isLoading;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hex-code">
          Hex Code
        </Label>
        <Input
          id="hex-code"
          placeholder="FF 00 A3 ..."
          value={hexCode}
          onChange={handleHexChange}
          className="font-mono"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter hex values (e.g., FF 00 A3)
          {hexCode && !isValidHex(hexCode) && (
            <span className="text-destructive"> - Invalid hex format</span>
          )}
        </p>
      </div>

      {/* Repeat Options */}
      <div className="flex items-center justify-between">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={toggleRepeatOptions}
          className="flex items-center gap-1"
        >
          <RepeatIcon className="h-4 w-4" />
          {showRepeatOptions ? "Hide Repeat Options" : "Show Repeat Options"}
        </Button>
        {showRepeatOptions && (
          <div className="flex items-center gap-2">
            <Label htmlFor="repeat-count" className="text-sm whitespace-nowrap">
              Repeat Count:
            </Label>
            <Input
              id="repeat-count"
              type="number"
              min="1"
              max="100"
              value={repeatCount}
              onChange={handleRepeatChange}
              className="w-20"
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      <Button 
        onClick={onSendHex} 
        className="w-full" 
        disabled={!canSend}
        variant={canSend ? "success" : "default"}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending{repeatCount > 1 ? ` (${repeatCount}x)` : ''}...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Connect & Send{repeatCount > 1 ? ` (${repeatCount}x)` : ''}
          </>
        )}
      </Button>
    </div>
  );
};

export default HexInput;
