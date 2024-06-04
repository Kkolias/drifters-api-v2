import { IQualifyingResultItem } from "../../Schema/drift/Qualifying";

export function sortQualifyingResults(
  qualifyingResults: IQualifyingResultItem[]
): IQualifyingResultItem[] {
  // sorts by orderNumber
  return (
    qualifyingResults.sort((a, b) => a?.orderNumber - b?.orderNumber) || []
  );
}
