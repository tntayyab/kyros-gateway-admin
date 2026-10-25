"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = exports.entities = void 0;
const agent_message_entity_1 = require("../entities/agent-message.entity");
const request_entity_1 = require("../entities/request.entity");
const api_key_entity_1 = require("../entities/api-key.entity");
const tenant_entity_1 = require("../entities/tenant.entity");
const agent_entity_1 = require("../entities/agent.entity");
const agent_api_key_entity_1 = require("../entities/agent-api-key.entity");
const notification_rule_entity_1 = require("../entities/notification-rule.entity");
const notification_log_entity_1 = require("../entities/notification-log.entity");
const email_provider_config_entity_1 = require("../entities/email-provider-config.entity");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const tier_assignment_entity_1 = require("../entities/tier-assignment.entity");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
const specificity_assignment_entity_1 = require("../entities/specificity-assignment.entity");
const header_tier_entity_1 = require("../entities/header-tier.entity");
const install_metadata_entity_1 = require("../entities/install-metadata.entity");
const backfill_state_entity_1 = require("../entities/backfill-state.entity");
const agent_model_params_entity_1 = require("../entities/agent-model-params.entity");
const playground_run_entity_1 = require("../entities/playground-run.entity");
const playground_column_entity_1 = require("../entities/playground-column.entity");
const reasoning_content_cache_entry_entity_1 = require("../entities/reasoning-content-cache-entry.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const public_error_page_entity_1 = require("../entities/public-error-page.entity");
const waitlist_claim_entity_1 = require("../entities/waitlist-claim.entity");
const tenant_request_usage_entity_1 = require("../entities/tenant-request-usage.entity");
const cli_auth_code_entity_1 = require("../entities/cli-auth-code.entity");
const agent_usage_daily_entity_1 = require("../entities/agent-usage-daily.entity");
const _1800000000000_RenameWaitlistClaimsTable_1 = require("./migrations/1800000000000-RenameWaitlistClaimsTable");
const _1800100000000_ReclassifyPlanRequestLimitMessages_1 = require("./migrations/1800100000000-ReclassifyPlanRequestLimitMessages");
const _1800200000000_AddMessageErrorCode_1 = require("./migrations/1800200000000-AddMessageErrorCode");
const _1800300000000_DropUnusedAgentMessageIndexes_1 = require("./migrations/1800300000000-DropUnusedAgentMessageIndexes");
const _1801200000000_ExtendDashboardCoveringIndex_1 = require("./migrations/1801200000000-ExtendDashboardCoveringIndex");
const _1801300000000_AddTenantRequestUsage_1 = require("./migrations/1801300000000-AddTenantRequestUsage");
const _1801300000000_AddRequestRecordings_1 = require("./migrations/1801300000000-AddRequestRecordings");
const _1801400000000_MoveRecordingsToProviderAttempts_1 = require("./migrations/1801400000000-MoveRecordingsToProviderAttempts");
const _1801500000000_EnableRecordingForNewAgents_1 = require("./migrations/1801500000000-EnableRecordingForNewAgents");
const _1801600000000_DropLegacyAutofixRolloutColumns_1 = require("./migrations/1801600000000-DropLegacyAutofixRolloutColumns");
const _1801700000000_AddApiKeyExpiresAt_1 = require("./migrations/1801700000000-AddApiKeyExpiresAt");
const _1801710000000_CreateCliAuthCodes_1 = require("./migrations/1801710000000-CreateCliAuthCodes");
const _1801720000000_AddRequestApiMode_1 = require("./migrations/1801720000000-AddRequestApiMode");
const _1801730000000_AddCliAuthCodeChallenge_1 = require("./migrations/1801730000000-AddCliAuthCodeChallenge");
const _1801740000000_AddApiKeyAbsoluteExpiresAt_1 = require("./migrations/1801740000000-AddApiKeyAbsoluteExpiresAt");
const _1801900000000_AddAutofixConsentToInstallMetadata_1 = require("./migrations/1801900000000-AddAutofixConsentToInstallMetadata");
const _1802000000000_SlimTenantAgentModelIndex_1 = require("./migrations/1802000000000-SlimTenantAgentModelIndex");
const _1802100000000_AddCustomProviderAlias_1 = require("./migrations/1802100000000-AddCustomProviderAlias");
const _1802200000000_AddRequestsAutofixHealedIndex_1 = require("./migrations/1802200000000-AddRequestsAutofixHealedIndex");
const _1802400000000_TuneFactTableAutovacuum_1 = require("./migrations/1802400000000-TuneFactTableAutovacuum");
const _1802500000000_AddAgentMessagesUnlinkedIndex_1 = require("./migrations/1802500000000-AddAgentMessagesUnlinkedIndex");
const _1802600000000_AddAgentMessagesRecordingIndex_1 = require("./migrations/1802600000000-AddAgentMessagesRecordingIndex");
const _1802700000000_AddAgentMessagesAutofixAttemptIndex_1 = require("./migrations/1802700000000-AddAgentMessagesAutofixAttemptIndex");
const _1802800000000_AddAgentUsageDaily_1 = require("./migrations/1802800000000-AddAgentUsageDaily");
const _1802900000000_AddAgentMessagesDirectUsageIndex_1 = require("./migrations/1802900000000-AddAgentMessagesDirectUsageIndex");
const _1803000000000_CoverRequestsLogFilters_1 = require("./migrations/1803000000000-CoverRequestsLogFilters");
const _1803100000000_CoverHarnessRequestsIndex_1 = require("./migrations/1803100000000-CoverHarnessRequestsIndex");
const _1771464895790_InitialSchema_1 = require("./migrations/1771464895790-InitialSchema");
const _1771500000000_HashApiKeys_1 = require("./migrations/1771500000000-HashApiKeys");
const _1771600000000_ModelPricingImprovements_1 = require("./migrations/1771600000000-ModelPricingImprovements");
const _1771700000000_EmailProviderConfigs_1 = require("./migrations/1771700000000-EmailProviderConfigs");
const _1771800000000_AddNotificationEmailAndOptionalDomain_1 = require("./migrations/1771800000000-AddNotificationEmailAndOptionalDomain");
const _1771600000000_AddModelCapabilities_1 = require("./migrations/1771600000000-AddModelCapabilities");
const _1771700000000_AddRoutingTables_1 = require("./migrations/1771700000000-AddRoutingTables");
const _1771800000000_AddQualityScore_1 = require("./migrations/1771800000000-AddQualityScore");
const _1771800100000_SeedQualityScores_1 = require("./migrations/1771800100000-SeedQualityScores");
const _1771900000000_EncryptApiKeys_1 = require("./migrations/1771900000000-EncryptApiKeys");
const _1772000000000_MakeApiKeyNullable_1 = require("./migrations/1772000000000-MakeApiKeyNullable");
const _1772100000000_AddRoutingTier_1 = require("./migrations/1772100000000-AddRoutingTier");
const _1772200000000_AddLimitAction_1 = require("./migrations/1772200000000-AddLimitAction");
const _1772300000000_AddRoutingReason_1 = require("./migrations/1772300000000-AddRoutingReason");
const _1772400000000_AddAgentDisplayName_1 = require("./migrations/1772400000000-AddAgentDisplayName");
const _1772500000000_PerAgentRouting_1 = require("./migrations/1772500000000-PerAgentRouting");
const _1772668898071_AddCustomProviders_1 = require("./migrations/1772668898071-AddCustomProviders");
const _1772682112419_NullablePricing_1 = require("./migrations/1772682112419-NullablePricing");
const _1772843035514_AddPerformanceIndexes_1 = require("./migrations/1772843035514-AddPerformanceIndexes");
const _1772900000000_AddProviderAuthType_1 = require("./migrations/1772900000000-AddProviderAuthType");
const _1772905146384_AddDashboardIndexes_1 = require("./migrations/1772905146384-AddDashboardIndexes");
const _1772905260464_AddFallbacks_1 = require("./migrations/1772905260464-AddFallbacks");
const _1772920000000_AddModelDisplayName_1 = require("./migrations/1772920000000-AddModelDisplayName");
const _1772940000000_DropRedundantIndexes_1 = require("./migrations/1772940000000-DropRedundantIndexes");
const _1772948502780_BackfillTenantId_1 = require("./migrations/1772948502780-BackfillTenantId");
const _1772960000000_DropUnusedIndexes_1 = require("./migrations/1772960000000-DropUnusedIndexes");
const _1772960000000_PurgeNonCuratedModels_1 = require("./migrations/1772960000000-PurgeNonCuratedModels");
const _1773000000000_ExpandProviderUniqueKey_1 = require("./migrations/1773000000000-ExpandProviderUniqueKey");
const _1773100000000_AddOverrideAuthType_1 = require("./migrations/1773100000000-AddOverrideAuthType");
const _1773200000000_AddMessageAuthType_1 = require("./migrations/1773200000000-AddMessageAuthType");
const _1773202787708_AddModelsAgentIndex_1 = require("./migrations/1773202787708-AddModelsAgentIndex");
const _1773300000000_AddEmailProviderKeyPrefix_1 = require("./migrations/1773300000000-AddEmailProviderKeyPrefix");
const _1773400000000_AddProviderModelCache_1 = require("./migrations/1773400000000-AddProviderModelCache");
const _1773500000000_DropModelPricingTables_1 = require("./migrations/1773500000000-DropModelPricingTables");
const _1773600000000_AddOverrideProvider_1 = require("./migrations/1773600000000-AddOverrideProvider");
const _1773650000000_AddProviderRegion_1 = require("./migrations/1773650000000-AddProviderRegion");
const _1773700000000_DropSecurityEventTable_1 = require("./migrations/1773700000000-DropSecurityEventTable");
const _1773800000000_FixNegativeCosts_1 = require("./migrations/1773800000000-FixNegativeCosts");
const _1773900000000_AddKeyPrefixIndex_1 = require("./migrations/1773900000000-AddKeyPrefixIndex");
const _1774000000000_WidenKeyHashColumn_1 = require("./migrations/1774000000000-WidenKeyHashColumn");
const _1774896789000_WidenApiKeyColumn_1 = require("./migrations/1774896789000-WidenApiKeyColumn");
const _1775000000000_AddErrorHttpStatus_1 = require("./migrations/1775000000000-AddErrorHttpStatus");
const _1775100000000_AddAgentType_1 = require("./migrations/1775100000000-AddAgentType");
const _1775200000000_AddSpecificityAssignments_1 = require("./migrations/1775200000000-AddSpecificityAssignments");
const _1775300000000_AddSpecificityCategory_1 = require("./migrations/1775300000000-AddSpecificityCategory");
const _1775400000000_AddCallerAttribution_1 = require("./migrations/1775400000000-AddCallerAttribution");
const _1775500000000_AddMessageProvider_1 = require("./migrations/1775500000000-AddMessageProvider");
const _1775600000000_AddMessageFeedback_1 = require("./migrations/1775600000000-AddMessageFeedback");
const _1775700000000_AddInstallMetadata_1 = require("./migrations/1775700000000-AddInstallMetadata");
const _1776679833383_CleanupOrphanedCustomProviderRefs_1 = require("./migrations/1776679833383-CleanupOrphanedCustomProviderRefs");
const _1776700000000_AddMessageRequestHeaders_1 = require("./migrations/1776700000000-AddMessageRequestHeaders");
const _1776710000000_AddHeaderTiers_1 = require("./migrations/1776710000000-AddHeaderTiers");
const _1777000000000_AddSpecificityMiscategorized_1 = require("./migrations/1777000000000-AddSpecificityMiscategorized");
const _1777100000000_AddComplexityRoutingFlag_1 = require("./migrations/1777100000000-AddComplexityRoutingFlag");
const _1777100000000_AddHeaderTierEnabled_1 = require("./migrations/1777100000000-AddHeaderTierEnabled");
const _1777200000000_AddCustomProviderApiKind_1 = require("./migrations/1777200000000-AddCustomProviderApiKind");
const _1777200000000_CanonicalizeTileProviderMessages_1 = require("./migrations/1777200000000-CanonicalizeTileProviderMessages");
const _1777200000000_BackfillLocalAuthType_1 = require("./migrations/1777200000000-BackfillLocalAuthType");
const _1777300000000_BackfillLocalCustomProviders_1 = require("./migrations/1777300000000-BackfillLocalCustomProviders");
const _1780000000000_DropComplexityRoutingFlag_1 = require("./migrations/1780000000000-DropComplexityRoutingFlag");
const _1781000000000_ReAddComplexityRoutingFlag_1 = require("./migrations/1781000000000-ReAddComplexityRoutingFlag");
const _1782000000000_RetuneSpecificityMiscategorizedIndex_1 = require("./migrations/1782000000000-RetuneSpecificityMiscategorizedIndex");
const _1782200000000_AddAgentSoftDelete_1 = require("./migrations/1782200000000-AddAgentSoftDelete");
const _1783000000000_AddModelRouteColumns_1 = require("./migrations/1783000000000-AddModelRouteColumns");
const _1784000000000_DropLegacyRoutingColumns_1 = require("./migrations/1784000000000-DropLegacyRoutingColumns");
const _1785000000000_AddParamDefaultsColumns_1 = require("./migrations/1785000000000-AddParamDefaultsColumns");
const _1785000000000_AddProviderKeyLabelAndPriority_1 = require("./migrations/1785000000000-AddProviderKeyLabelAndPriority");
const _1785100000000_AddProviderKeyLabelToAgentMessages_1 = require("./migrations/1785100000000-AddProviderKeyLabelToAgentMessages");
const _1786000000000_AddRequestParamsColumn_1 = require("./migrations/1786000000000-AddRequestParamsColumn");
const _1786100000000_AddAgentRecordMessages_1 = require("./migrations/1786100000000-AddAgentRecordMessages");
const _1786200000000_AddMessageRecordings_1 = require("./migrations/1786200000000-AddMessageRecordings");
const _1786300000000_DefaultRecordMessagesTrue_1 = require("./migrations/1786300000000-DefaultRecordMessagesTrue");
const _1787000000000_AddAgentModelParams_1 = require("./migrations/1787000000000-AddAgentModelParams");
const _1788000000000_AddBenchmarkHistory_1 = require("./migrations/1788000000000-AddBenchmarkHistory");
const _1789000000000_RenameBenchmarkToPlayground_1 = require("./migrations/1789000000000-RenameBenchmarkToPlayground");
const _1789100000000_AddOAuthPendingFlows_1 = require("./migrations/1789100000000-AddOAuthPendingFlows");
const _1789200000000_ScopeAgentModelParams_1 = require("./migrations/1789200000000-ScopeAgentModelParams");
const _1789300000000_EnableRecordMessagesForAll_1 = require("./migrations/1789300000000-EnableRecordMessagesForAll");
const _1789300000000_AddRoutingOutputControls_1 = require("./migrations/1789300000000-AddRoutingOutputControls");
const _1790000000000_AddAgentApiKeyPrefixActiveIndex_1 = require("./migrations/1790000000000-AddAgentApiKeyPrefixActiveIndex");
const _1790100000000_AddReasoningContentCache_1 = require("./migrations/1790100000000-AddReasoningContentCache");
const _1790200000000_AddDedupCompositeIndex_1 = require("./migrations/1790200000000-AddDedupCompositeIndex");
const _1790300000000_AddErrorsPartialIndex_1 = require("./migrations/1790300000000-AddErrorsPartialIndex");
const _1790400000000_DropRedundantAgentApiKeyPrefixIndex_1 = require("./migrations/1790400000000-DropRedundantAgentApiKeyPrefixIndex");
const _1791000000000_LiftProvidersToUserLevel_1 = require("./migrations/1791000000000-LiftProvidersToUserLevel");
const _1791200000000_LiftCustomProvidersToUserLevel_1 = require("./migrations/1791200000000-LiftCustomProvidersToUserLevel");
const _1791400000000_SeedPlaygroundAgents_1 = require("./migrations/1791400000000-SeedPlaygroundAgents");
const _1791600000000_DropProviderRateLimits_1 = require("./migrations/1791600000000-DropProviderRateLimits");
const _1791700000000_DropSavingsBaselineColumns_1 = require("./migrations/1791700000000-DropSavingsBaselineColumns");
const _1791800000000_RenameProviderAccessToEnabledProviders_1 = require("./migrations/1791800000000-RenameProviderAccessToEnabledProviders");
const _1791900000000_RenameIsSystemToIsPlayground_1 = require("./migrations/1791900000000-RenameIsSystemToIsPlayground");
const _1792000000000_AddUserProviderIdToAgentMessages_1 = require("./migrations/1792000000000-AddUserProviderIdToAgentMessages");
const _1792100000000_AddCustomProviderFkToUserProviders_1 = require("./migrations/1792100000000-AddCustomProviderFkToUserProviders");
const _1792400000000_TenantOwnerColumn_1 = require("./migrations/1792400000000-TenantOwnerColumn");
const _1792500000000_TenantProviders_1 = require("./migrations/1792500000000-TenantProviders");
const _1792600000000_TenantScopedConfigs_1 = require("./migrations/1792600000000-TenantScopedConfigs");
const _1792700000000_DropUserScopeFromRouting_1 = require("./migrations/1792700000000-DropUserScopeFromRouting");
const _1792800000000_AddBackfillStateTable_1 = require("./migrations/1792800000000-AddBackfillStateTable");
const _1792900000000_TuneAgentMessagesAutovacuum_1 = require("./migrations/1792900000000-TuneAgentMessagesAutovacuum");
const _1793000000000_AddTenantProviderValueIndex_1 = require("./migrations/1793000000000-AddTenantProviderValueIndex");
const _1793100000000_DropRedundantTenantAgentNameIndex_1 = require("./migrations/1793100000000-DropRedundantTenantAgentNameIndex");
const _1793200000000_AddDashboardCoveringIndex_1 = require("./migrations/1793200000000-AddDashboardCoveringIndex");
const _1795100000000_AddCrossTenantErrorTimestampIndex_1 = require("./migrations/1795100000000-AddCrossTenantErrorTimestampIndex");
const _1795000000000_RemoveMessageRecording_1 = require("./migrations/1795000000000-RemoveMessageRecording");
const _1796000000000_AddAutofixWaitlist_1 = require("./migrations/1796000000000-AddAutofixWaitlist");
const _1797000000000_AddPublicErrorPages_1 = require("./migrations/1797000000000-AddPublicErrorPages");
const _1798000000000_AddErrorClassification_1 = require("./migrations/1798000000000-AddErrorClassification");
const _1798100000000_AddTenantLimitOverrides_1 = require("./migrations/1798100000000-AddTenantLimitOverrides");
const _1798200000000_AddBillingEmailLogs_1 = require("./migrations/1798200000000-AddBillingEmailLogs");
const _1798300000000_AddBillingEmailPreferences_1 = require("./migrations/1798300000000-AddBillingEmailPreferences");
const _1799000000000_AddAutofixWaitlistSignups_1 = require("./migrations/1799000000000-AddAutofixWaitlistSignups");
const _1799000010000_AddAutofixAgentFlags_1 = require("./migrations/1799000010000-AddAutofixAgentFlags");
const _1799000100000_AddAutofixMessageFields_1 = require("./migrations/1799000100000-AddAutofixMessageFields");
const _1799000200000_AddAutofixPhoenixIds_1 = require("./migrations/1799000200000-AddAutofixPhoenixIds");
const _1799000300000_MakeAutofixEnabledNullable_1 = require("./migrations/1799000300000-MakeAutofixEnabledNullable");
const _1799000400000_AddAutofixAccessGrant_1 = require("./migrations/1799000400000-AddAutofixAccessGrant");
const _1801000000000_AddRequestsAndProviderAttempts_1 = require("./migrations/1801000000000-AddRequestsAndProviderAttempts");
const _1801100000000_AddProviderAttemptOrdering_1 = require("./migrations/1801100000000-AddProviderAttemptOrdering");
exports.entities = [
    agent_message_entity_1.AgentMessage,
    request_entity_1.ManifestRequest,
    api_key_entity_1.ApiKey,
    tenant_entity_1.Tenant,
    agent_entity_1.Agent,
    agent_api_key_entity_1.AgentApiKey,
    notification_rule_entity_1.NotificationRule,
    notification_log_entity_1.NotificationLog,
    email_provider_config_entity_1.EmailProviderConfig,
    tenant_provider_entity_1.TenantProvider,
    tier_assignment_entity_1.TierAssignment,
    custom_provider_entity_1.CustomProvider,
    specificity_assignment_entity_1.SpecificityAssignment,
    header_tier_entity_1.HeaderTier,
    install_metadata_entity_1.InstallMetadata,
    agent_model_params_entity_1.AgentModelParams,
    playground_run_entity_1.PlaygroundRun,
    playground_column_entity_1.PlaygroundColumn,
    reasoning_content_cache_entry_entity_1.ReasoningContentCacheEntry,
    agent_enabled_provider_entity_1.AgentEnabledProvider,
    backfill_state_entity_1.BackfillState,
    public_error_page_entity_1.PublicErrorPage,
    waitlist_claim_entity_1.WaitlistClaim,
    tenant_request_usage_entity_1.TenantRequestUsage,
    cli_auth_code_entity_1.CliAuthCode,
    agent_usage_daily_entity_1.AgentUsageDaily,
];
exports.migrations = [
    _1771464895790_InitialSchema_1.InitialSchema1771464895790,
    _1771500000000_HashApiKeys_1.HashApiKeys1771500000000,
    _1771600000000_ModelPricingImprovements_1.ModelPricingImprovements1771600000000,
    _1771700000000_EmailProviderConfigs_1.EmailProviderConfigs1771700000000,
    _1771800000000_AddNotificationEmailAndOptionalDomain_1.AddNotificationEmailAndOptionalDomain1771800000000,
    _1771600000000_AddModelCapabilities_1.AddModelCapabilities1771600000000,
    _1771700000000_AddRoutingTables_1.AddRoutingTables1771700000000,
    _1771800000000_AddQualityScore_1.AddQualityScore1771800000000,
    _1771800100000_SeedQualityScores_1.SeedQualityScores1771800100000,
    _1771900000000_EncryptApiKeys_1.EncryptApiKeys1771900000000,
    _1772000000000_MakeApiKeyNullable_1.MakeApiKeyNullable1772000000000,
    _1772100000000_AddRoutingTier_1.AddRoutingTier1772100000000,
    _1772200000000_AddLimitAction_1.AddLimitAction1772200000000,
    _1772300000000_AddRoutingReason_1.AddRoutingReason1772300000000,
    _1772400000000_AddAgentDisplayName_1.AddAgentDisplayName1772400000000,
    _1772500000000_PerAgentRouting_1.PerAgentRouting1772500000000,
    _1772668898071_AddCustomProviders_1.AddCustomProviders1772668898071,
    _1772682112419_NullablePricing_1.NullablePricing1772682112419,
    _1772843035514_AddPerformanceIndexes_1.AddPerformanceIndexes1772843035514,
    _1772900000000_AddProviderAuthType_1.AddProviderAuthType1772900000000,
    _1772905146384_AddDashboardIndexes_1.AddDashboardIndexes1772905146384,
    _1772905260464_AddFallbacks_1.AddFallbacks1772905260464,
    _1772920000000_AddModelDisplayName_1.AddModelDisplayName1772920000000,
    _1772940000000_DropRedundantIndexes_1.DropRedundantIndexes1772940000000,
    _1772948502780_BackfillTenantId_1.BackfillTenantId1772948502780,
    _1772960000000_DropUnusedIndexes_1.DropUnusedIndexes1772960000000,
    _1772960000000_PurgeNonCuratedModels_1.PurgeNonCuratedModels1772960000000,
    _1773000000000_ExpandProviderUniqueKey_1.ExpandProviderUniqueKey1773000000000,
    _1773100000000_AddOverrideAuthType_1.AddOverrideAuthType1773100000000,
    _1773200000000_AddMessageAuthType_1.AddMessageAuthType1773200000000,
    _1773202787708_AddModelsAgentIndex_1.AddModelsAgentIndex1773202787708,
    _1773300000000_AddEmailProviderKeyPrefix_1.AddEmailProviderKeyPrefix1773300000000,
    _1773400000000_AddProviderModelCache_1.AddProviderModelCache1773400000000,
    _1773500000000_DropModelPricingTables_1.DropModelPricingTables1773500000000,
    _1773600000000_AddOverrideProvider_1.AddOverrideProvider1773600000000,
    _1773650000000_AddProviderRegion_1.AddProviderRegion1773650000000,
    _1773700000000_DropSecurityEventTable_1.DropSecurityEventTable1773700000000,
    _1773800000000_FixNegativeCosts_1.FixNegativeCosts1773800000000,
    _1773900000000_AddKeyPrefixIndex_1.AddKeyPrefixIndex1773900000000,
    _1774000000000_WidenKeyHashColumn_1.WidenKeyHashColumn1774000000000,
    _1774896789000_WidenApiKeyColumn_1.WidenApiKeyColumn1774896789000,
    _1775000000000_AddErrorHttpStatus_1.AddErrorHttpStatus1775000000000,
    _1775100000000_AddAgentType_1.AddAgentType1775100000000,
    _1775200000000_AddSpecificityAssignments_1.AddSpecificityAssignments1775200000000,
    _1775300000000_AddSpecificityCategory_1.AddSpecificityCategory1775300000000,
    _1775400000000_AddCallerAttribution_1.AddCallerAttribution1775400000000,
    _1775500000000_AddMessageProvider_1.AddMessageProvider1775500000000,
    _1775600000000_AddMessageFeedback_1.AddMessageFeedback1775600000000,
    _1775700000000_AddInstallMetadata_1.AddInstallMetadata1775700000000,
    _1776679833383_CleanupOrphanedCustomProviderRefs_1.CleanupOrphanedCustomProviderRefs1776679833383,
    _1776700000000_AddMessageRequestHeaders_1.AddMessageRequestHeaders1776700000000,
    _1776710000000_AddHeaderTiers_1.AddHeaderTiers1776710000000,
    _1777000000000_AddSpecificityMiscategorized_1.AddSpecificityMiscategorized1777000000000,
    _1777100000000_AddComplexityRoutingFlag_1.AddComplexityRoutingFlag1777100000000,
    _1777100000000_AddHeaderTierEnabled_1.AddHeaderTierEnabled1777100000000,
    _1777200000000_AddCustomProviderApiKind_1.AddCustomProviderApiKind1777200000000,
    _1777200000000_CanonicalizeTileProviderMessages_1.CanonicalizeTileProviderMessages1777200000000,
    _1777200000000_BackfillLocalAuthType_1.BackfillLocalAuthType1777200000000,
    _1777300000000_BackfillLocalCustomProviders_1.BackfillLocalCustomProviders1777300000000,
    _1780000000000_DropComplexityRoutingFlag_1.DropComplexityRoutingFlag1780000000000,
    _1781000000000_ReAddComplexityRoutingFlag_1.ReAddComplexityRoutingFlag1781000000000,
    _1782000000000_RetuneSpecificityMiscategorizedIndex_1.RetuneSpecificityMiscategorizedIndex1782000000000,
    _1782200000000_AddAgentSoftDelete_1.AddAgentSoftDelete1782200000000,
    _1783000000000_AddModelRouteColumns_1.AddModelRouteColumns1783000000000,
    _1784000000000_DropLegacyRoutingColumns_1.DropLegacyRoutingColumns1784000000000,
    _1785000000000_AddParamDefaultsColumns_1.AddParamDefaultsColumns1785000000000,
    _1785000000000_AddProviderKeyLabelAndPriority_1.AddProviderKeyLabelAndPriority1785000000000,
    _1785100000000_AddProviderKeyLabelToAgentMessages_1.AddProviderKeyLabelToAgentMessages1785100000000,
    _1786000000000_AddRequestParamsColumn_1.AddRequestParamsColumn1786000000000,
    _1786100000000_AddAgentRecordMessages_1.AddAgentRecordMessages1786100000000,
    _1786200000000_AddMessageRecordings_1.AddMessageRecordings1786200000000,
    _1786300000000_DefaultRecordMessagesTrue_1.DefaultRecordMessagesTrue1786300000000,
    _1787000000000_AddAgentModelParams_1.AddAgentModelParams1787000000000,
    _1788000000000_AddBenchmarkHistory_1.AddBenchmarkHistory1788000000000,
    _1789000000000_RenameBenchmarkToPlayground_1.RenameBenchmarkToPlayground1789000000000,
    _1789100000000_AddOAuthPendingFlows_1.AddOAuthPendingFlows1789100000000,
    _1789200000000_ScopeAgentModelParams_1.ScopeAgentModelParams1789200000000,
    _1789300000000_EnableRecordMessagesForAll_1.EnableRecordMessagesForAll1789300000000,
    _1789300000000_AddRoutingOutputControls_1.AddRoutingOutputControls1789300000000,
    _1790000000000_AddAgentApiKeyPrefixActiveIndex_1.AddAgentApiKeyPrefixActiveIndex1790000000000,
    _1790100000000_AddReasoningContentCache_1.AddReasoningContentCache1790100000000,
    _1790200000000_AddDedupCompositeIndex_1.AddDedupCompositeIndex1790200000000,
    _1790300000000_AddErrorsPartialIndex_1.AddErrorsPartialIndex1790300000000,
    _1790400000000_DropRedundantAgentApiKeyPrefixIndex_1.DropRedundantAgentApiKeyPrefixIndex1790400000000,
    _1791000000000_LiftProvidersToUserLevel_1.LiftProvidersToUserLevel1791000000000,
    _1791200000000_LiftCustomProvidersToUserLevel_1.LiftCustomProvidersToUserLevel1791200000000,
    _1791400000000_SeedPlaygroundAgents_1.SeedPlaygroundAgents1791400000000,
    _1791600000000_DropProviderRateLimits_1.DropProviderRateLimits1791600000000,
    _1791700000000_DropSavingsBaselineColumns_1.DropSavingsBaselineColumns1791700000000,
    _1791800000000_RenameProviderAccessToEnabledProviders_1.RenameProviderAccessToEnabledProviders1791800000000,
    _1791900000000_RenameIsSystemToIsPlayground_1.RenameIsSystemToIsPlayground1791900000000,
    _1792000000000_AddUserProviderIdToAgentMessages_1.AddUserProviderIdToAgentMessages1792000000000,
    _1792100000000_AddCustomProviderFkToUserProviders_1.AddCustomProviderFkToUserProviders1792100000000,
    _1792400000000_TenantOwnerColumn_1.TenantOwnerColumn1792400000000,
    _1792500000000_TenantProviders_1.TenantProviders1792500000000,
    _1792600000000_TenantScopedConfigs_1.TenantScopedConfigs1792600000000,
    _1792700000000_DropUserScopeFromRouting_1.DropUserScopeFromRouting1792700000000,
    _1792800000000_AddBackfillStateTable_1.AddBackfillStateTable1792800000000,
    _1792900000000_TuneAgentMessagesAutovacuum_1.TuneAgentMessagesAutovacuum1792900000000,
    _1793000000000_AddTenantProviderValueIndex_1.AddTenantProviderValueIndex1793000000000,
    _1793100000000_DropRedundantTenantAgentNameIndex_1.DropRedundantTenantAgentNameIndex1793100000000,
    _1793200000000_AddDashboardCoveringIndex_1.AddDashboardCoveringIndex1793200000000,
    _1795000000000_RemoveMessageRecording_1.RemoveMessageRecording1795000000000,
    _1795100000000_AddCrossTenantErrorTimestampIndex_1.AddCrossTenantErrorTimestampIndex1795100000000,
    _1796000000000_AddAutofixWaitlist_1.AddAutofixWaitlist1796000000000,
    _1797000000000_AddPublicErrorPages_1.AddPublicErrorPages1797000000000,
    _1798000000000_AddErrorClassification_1.AddErrorClassification1798000000000,
    _1798100000000_AddTenantLimitOverrides_1.AddTenantLimitOverrides1798100000000,
    _1798200000000_AddBillingEmailLogs_1.AddBillingEmailLogs1798200000000,
    _1798300000000_AddBillingEmailPreferences_1.AddBillingEmailPreferences1798300000000,
    _1799000000000_AddAutofixWaitlistSignups_1.AddAutofixWaitlistSignups1799000000000,
    _1799000010000_AddAutofixAgentFlags_1.AddAutofixAgentFlags1799000010000,
    _1799000100000_AddAutofixMessageFields_1.AddAutofixMessageFields1799000100000,
    _1799000200000_AddAutofixPhoenixIds_1.AddAutofixPhoenixIds1799000200000,
    _1799000300000_MakeAutofixEnabledNullable_1.MakeAutofixEnabledNullable1799000300000,
    _1799000400000_AddAutofixAccessGrant_1.AddAutofixAccessGrant1799000400000,
    _1800000000000_RenameWaitlistClaimsTable_1.RenameWaitlistClaimsTable1800000000000,
    _1800100000000_ReclassifyPlanRequestLimitMessages_1.ReclassifyPlanRequestLimitMessages1800100000000,
    _1800200000000_AddMessageErrorCode_1.AddMessageErrorCode1800200000000,
    _1800300000000_DropUnusedAgentMessageIndexes_1.DropUnusedAgentMessageIndexes1800300000000,
    _1801000000000_AddRequestsAndProviderAttempts_1.AddRequestsAndProviderAttempts1801000000000,
    _1801100000000_AddProviderAttemptOrdering_1.AddProviderAttemptOrdering1801100000000,
    _1801200000000_ExtendDashboardCoveringIndex_1.ExtendDashboardCoveringIndex1801200000000,
    _1801300000000_AddTenantRequestUsage_1.AddTenantRequestUsage1801300000000,
    _1801300000000_AddRequestRecordings_1.AddRequestRecordings1801300000000,
    _1801400000000_MoveRecordingsToProviderAttempts_1.MoveRecordingsToProviderAttempts1801400000000,
    _1801500000000_EnableRecordingForNewAgents_1.EnableRecordingForNewAgents1801500000000,
    _1801600000000_DropLegacyAutofixRolloutColumns_1.DropLegacyAutofixRolloutColumns1801600000000,
    _1801700000000_AddApiKeyExpiresAt_1.AddApiKeyExpiresAt1801700000000,
    _1801710000000_CreateCliAuthCodes_1.CreateCliAuthCodes1801710000000,
    _1801720000000_AddRequestApiMode_1.AddRequestApiMode1801720000000,
    _1801730000000_AddCliAuthCodeChallenge_1.AddCliAuthCodeChallenge1801730000000,
    _1801740000000_AddApiKeyAbsoluteExpiresAt_1.AddApiKeyAbsoluteExpiresAt1801740000000,
    _1801900000000_AddAutofixConsentToInstallMetadata_1.AddAutofixConsentToInstallMetadata1801900000000,
    _1802000000000_SlimTenantAgentModelIndex_1.SlimTenantAgentModelIndex1802000000000,
    _1802100000000_AddCustomProviderAlias_1.AddCustomProviderAlias1802100000000,
    _1802200000000_AddRequestsAutofixHealedIndex_1.AddRequestsAutofixHealedIndex1802200000000,
    _1802400000000_TuneFactTableAutovacuum_1.TuneFactTableAutovacuum1802400000000,
    _1802500000000_AddAgentMessagesUnlinkedIndex_1.AddAgentMessagesUnlinkedIndex1802500000000,
    _1802600000000_AddAgentMessagesRecordingIndex_1.AddAgentMessagesRecordingIndex1802600000000,
    _1802700000000_AddAgentMessagesAutofixAttemptIndex_1.AddAgentMessagesAutofixAttemptIndex1802700000000,
    _1802800000000_AddAgentUsageDaily_1.AddAgentUsageDaily1802800000000,
    _1802900000000_AddAgentMessagesDirectUsageIndex_1.AddAgentMessagesDirectUsageIndex1802900000000,
    _1803000000000_CoverRequestsLogFilters_1.CoverRequestsLogFilters1803000000000,
    _1803100000000_CoverHarnessRequestsIndex_1.CoverHarnessRequestsIndex1803100000000,
];
//# sourceMappingURL=data-source-definitions.js.map