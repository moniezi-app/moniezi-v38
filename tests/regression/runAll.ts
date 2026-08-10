import { runJobProfitabilityRegressionTests } from './jobProfitability.test';
import { runMileageDraftTests } from "./mileageDraft.test";
import { runHashRoutingTests } from "./hashRouting.test";
import { runFundingMetricsTests } from "./fundingMetrics.test";

runMileageDraftTests();
runHashRoutingTests();
runFundingMetricsTests();
runJobProfitabilityRegressionTests();

console.log("Regression tests passed: mileage draft + hash routing + funding metrics + job profitability");
