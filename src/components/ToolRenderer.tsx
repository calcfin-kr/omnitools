import React from "react";
import { TextCounterTool } from "./tools/TextCounterTool";
import { CaseConverterTool } from "./tools/CaseConverterTool";
import { DiffCheckerTool } from "./tools/DiffCheckerTool";
import { MarkdownStudioTool } from "./tools/MarkdownStudioTool";
import { TextCleanSortTool } from "./tools/TextCleanSortTool";
import { JsonFormatterTool } from "./tools/JsonFormatterTool";
import { Base64StudioTool } from "./tools/Base64StudioTool";
import { CsvJsonConverterTool } from "./tools/CsvJsonConverterTool";
import { UrlParserTool } from "./tools/UrlParserTool";
import { JwtInspectorTool } from "./tools/JwtInspectorTool";
import { HashGeneratorTool } from "./tools/HashGeneratorTool";
import { PasswordUuidTool } from "./tools/PasswordUuidTool";
import { QrCodeStudioTool } from "./tools/QrCodeStudioTool";
import { ImageResizerTool } from "./tools/ImageResizerTool";
import { ColorStudioTool } from "./tools/ColorStudioTool";
import { UnitConverterTool } from "./tools/UnitConverterTool";
import { DateCalculatorTool } from "./tools/DateCalculatorTool";
import { PercentageCalcTool } from "./tools/PercentageCalcTool";
import { TimezoneClockTool } from "./tools/TimezoneClockTool";
import { TimerStopwatchTool } from "./tools/TimerStopwatchTool";
import { RandomPickerTool } from "./tools/RandomPickerTool";
import { AiAssistantTool } from "./tools/AiAssistantTool";
import { AiRegexTool } from "./tools/AiRegexTool";

interface ToolRendererProps {
  toolId: string;
}

export const ToolRenderer: React.FC<ToolRendererProps> = ({ toolId }) => {
  switch (toolId) {
    case "csv-json-converter":
      return <CsvJsonConverterTool />;
    case "text-counter":
      return <TextCounterTool />;
    case "case-converter":
      return <CaseConverterTool />;
    case "diff-checker":
      return <DiffCheckerTool />;
    case "markdown-studio":
      return <MarkdownStudioTool />;
    case "text-clean-sort":
      return <TextCleanSortTool />;
    case "json-formatter":
      return <JsonFormatterTool />;
    case "base64-studio":
      return <Base64StudioTool />;
    case "url-parser":
      return <UrlParserTool />;
    case "jwt-inspector":
      return <JwtInspectorTool />;
    case "hash-generator":
      return <HashGeneratorTool />;
    case "password-uuid":
      return <PasswordUuidTool />;
    case "qr-studio":
      return <QrCodeStudioTool />;
    case "image-resizer":
      return <ImageResizerTool />;
    case "color-studio":
      return <ColorStudioTool />;
    case "unit-converter":
      return <UnitConverterTool />;
    case "date-calculator":
      return <DateCalculatorTool />;
    case "percentage-calc":
      return <PercentageCalcTool />;
    case "timezone-clock":
      return <TimezoneClockTool />;
    case "timer-stopwatch":
      return <TimerStopwatchTool />;
    case "random-picker":
      return <RandomPickerTool />;
    case "ai-assistant":
      return <AiAssistantTool />;
    case "ai-regex":
      return <AiRegexTool />;
    default:
      return <div className="p-8 text-center text-slate-500">도구를 선택해주세요.</div>;
  }
};
