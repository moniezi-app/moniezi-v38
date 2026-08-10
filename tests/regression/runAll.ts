import { runJobProfitabilityRegressionTests } from './jobProfitability.test';
import { runMileageDraftTests } from "./mileageDraft.test";
import { runHashRoutingTests } from "./hashRouting.test";
import { runFundingMetricsTests } from "./fundingMetrics.test";
import { runMonthlyGoalsRegressionTests } from './monthlyGoals.test';
import { runDemoDataRegressionTests } from './demoData.test';

runMileageDraftTests();
runHashRoutingTests();
runFundingMetricsTests();
runJobProfitabilityRegressionTests();
runMonthlyGoalsRegressionTests();
runDemoDataRegressionTests();

console.log("Regression tests passed: mileage draft + hash routing + funding metrics + job profitability + monthly goals + deterministic commercial demo");
