import type { Auth } from 'better-auth';
export declare const authOrigin: string;
export declare const authIssuer: string;
export declare const mcpResource: string;
export declare const mcpEnabled: boolean;
export declare const mcpDisabledReason: string | null;
export { MCP_READ_SCOPE, MCP_WRITE_SCOPE, MCP_SCOPES } from './mcp-scopes';
export declare const mcpResources: string[];
export declare function authOriginForHost(host: string | undefined): string;
export declare function authIssuerForHost(host: string | undefined): string;
export declare function mcpResourceForHost(host: string | undefined): string;
export declare const authBaseURL: string | {
    allowedHosts: string[];
    fallback: string;
    protocol: "http" | "https";
};
declare const pluginAuth: Auth<{
    database: any;
    baseURL: string | {
        allowedHosts: string[];
        fallback: string;
        protocol: "http" | "https";
    };
    basePath: string;
    secret: string;
    logger: {
        level: "debug";
    };
    telemetry: {
        enabled: false;
    };
    plugins: ({
        id: "jwt";
        version: string;
        options: NoInfer<import("better-auth/plugins").JwtOptions>;
        init(ctx: import("better-auth").AuthContext): {
            context: {
                sessionConfig: {
                    cookieCacheSigner: import("better-auth").CookieCacheSigner;
                    updateAge: number;
                    expiresIn: number;
                    freshAge: number;
                    cookieRefreshCache: false | {
                        enabled: true;
                        updateAge: number;
                    };
                };
            };
        } | undefined;
        endpoints: {
            getJwks: import("better-auth").StrictEndpoint<string, {
                method: "GET";
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                keys: {
                                                    type: string;
                                                    description: string;
                                                    items: {
                                                        type: string;
                                                        properties: {
                                                            kid: {
                                                                type: string;
                                                                description: string;
                                                            };
                                                            kty: {
                                                                type: string;
                                                                description: string;
                                                            };
                                                            alg: {
                                                                type: string;
                                                                description: string;
                                                            };
                                                            use: {
                                                                type: string;
                                                                description: string;
                                                                enum: string[];
                                                                nullable: boolean;
                                                            };
                                                            n: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                            e: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                            crv: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                            x: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                            y: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                        };
                                                        required: string[];
                                                    };
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("better-auth").JSONWebKeySet>;
            getToken: import("better-auth").StrictEndpoint<"/token", {
                method: "GET";
                requireHeaders: true;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                token: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                token: string;
            }>;
            signJWT: import("better-auth").StrictEndpoint<string, {
                method: "POST";
                metadata: {
                    $Infer: {
                        body: {
                            payload: import("better-auth").JWTPayload;
                            overrideOptions?: import("better-auth/plugins").JwtOptions | undefined;
                        };
                    };
                };
                body: import("better-auth").ZodObject<{
                    payload: import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>;
                    overrideOptions: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                }, import("zod/v4/core").$strip>;
            }, {
                token: string;
            }>;
            verifyJWT: import("better-auth").StrictEndpoint<string, {
                method: "POST";
                metadata: {
                    $Infer: {
                        body: {
                            token: string;
                            issuer?: string;
                        };
                        response: {
                            payload: {
                                sub: string;
                                aud: string;
                                [key: string]: any;
                            } | null;
                        };
                    };
                };
                body: import("better-auth").ZodObject<{
                    token: import("better-auth").ZodString;
                    issuer: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
            }, {
                payload: (import("better-auth").JWTPayload & Required<Pick<import("better-auth").JWTPayload, "sub" | "aud">>) | null;
            }>;
        };
        hooks: {
            after: {
                matcher(context: import("better-auth").HookEndpointContext): boolean;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>;
            }[];
        };
        schema: {
            jwks: {
                fields: {
                    publicKey: {
                        type: "string";
                        required: true;
                    };
                    privateKey: {
                        type: "string";
                        required: true;
                    };
                    createdAt: {
                        type: "date";
                        required: true;
                    };
                    expiresAt: {
                        type: "date";
                        required: false;
                    };
                    alg: {
                        type: "string";
                        required: false;
                    };
                    crv: {
                        type: "string";
                        required: false;
                    };
                };
            };
        };
    } | {
        id: "oauth-provider";
        version: string;
        options: NoInfer<import("@better-auth/oauth-provider/*").OAuthOptions<import("@better-auth/oauth-provider/*").Scope[]>>;
        onRequest: (request: Request, ctx: import("better-auth").AuthContext) => Promise<{
            response: Response;
        } | {
            request: Request;
        } | void>;
        init: (ctx: import("better-auth").AuthContext) => Promise<{
            options: {
                databaseHooks: {
                    session: {
                        delete: {
                            before(session: {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            } & Record<string, unknown>, hookCtx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                            after(session: {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            } & Record<string, unknown>, hookCtx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                        };
                    };
                };
            };
        }>;
        hooks: {
            before: {
                matcher(ctx: import("better-auth").HookEndpointContext): any;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>;
            }[];
            after: {
                matcher(ctx: import("better-auth").HookEndpointContext): boolean;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    redirect: true;
                    url: string;
                } | undefined>>;
            }[];
        };
        endpoints: {
            getOAuthServerConfig: import("better-auth").StrictEndpoint<"/.well-known/oauth-authorization-server", {
                method: "GET";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").AuthServerMetadata>;
            getOpenIdConfig: import("better-auth").StrictEndpoint<"/.well-known/openid-configuration", {
                method: "GET";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, {
                jwks_uri?: string | undefined;
                userinfo_endpoint: string;
                acr_values_supported?: string[] | undefined;
                subject_types_supported: ("public" | "pairwise")[];
                claims_supported: string[];
                claims_parameter_supported?: boolean | undefined;
                end_session_endpoint: string;
                request_parameter_supported?: boolean | undefined;
                request_uri_parameter_supported?: boolean | undefined;
                prompt_values_supported: import("@better-auth/oauth-provider/*").Prompt[];
                issuer: string;
                authorization_endpoint: string;
                token_endpoint: string;
                registration_endpoint?: string | undefined;
                scopes_supported?: string[] | undefined;
                response_types_supported: "code"[];
                response_modes_supported: "query"[];
                grant_types_supported: import("@better-auth/oauth-provider/*").GrantType[];
                token_endpoint_auth_methods_supported?: import("@better-auth/oauth-provider/*").TokenEndpointAuthMethod[] | undefined;
                token_endpoint_auth_signing_alg_values_supported?: import("better-auth").PrivateKeyJwtSigningAlgorithm[] | undefined;
                service_documentation?: string | undefined;
                ui_locales_supported?: string[] | undefined;
                op_policy_uri?: string | undefined;
                op_tos_uri?: string | undefined;
                revocation_endpoint?: string | undefined;
                revocation_endpoint_auth_methods_supported?: import("@better-auth/oauth-provider/*").TokenEndpointAuthMethod[] | undefined;
                revocation_endpoint_auth_signing_alg_values_supported?: import("better-auth").PrivateKeyJwtSigningAlgorithm[] | undefined;
                introspection_endpoint?: string | undefined;
                introspection_endpoint_auth_methods_supported?: import("@better-auth/oauth-provider/*").TokenEndpointAuthMethod[] | undefined;
                introspection_endpoint_auth_signing_alg_values_supported?: import("better-auth").PrivateKeyJwtSigningAlgorithm[] | undefined;
                code_challenge_methods_supported: "S256"[];
                authorization_response_iss_parameter_supported?: boolean | undefined;
                client_id_metadata_document_supported?: boolean | undefined;
                backchannel_logout_supported?: boolean | undefined;
                backchannel_logout_session_supported?: boolean | undefined;
                dpop_signing_alg_values_supported?: import("better-auth/plugins").JWSAlgorithms[] | undefined;
                id_token_signing_alg_values_supported: import("better-auth/plugins").JWSAlgorithms[] | ["HS256"];
            }>;
            oauth2Authorize: import("better-auth").StrictEndpoint<"/oauth2/authorize", {
                method: ("GET" | "POST")[];
                body: import("better-auth").ZodObject<{}, import("zod/v4/core").$loose>;
                redirectOnError: import("@better-auth/oauth-provider/*").OAuthRedirectOnError<import("better-auth").GenericEndpointContext, {
                    redirect: true;
                    url: string;
                }>;
                metadata: {
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        parameters: ({
                            name: string;
                            in: "query";
                            required: false;
                            schema: {
                                type: "string";
                                format?: undefined;
                                minimum?: undefined;
                                items?: undefined;
                            };
                            description: string;
                        } | {
                            name: string;
                            in: "query";
                            required: true;
                            schema: {
                                type: "string";
                                format?: undefined;
                                minimum?: undefined;
                                items?: undefined;
                            };
                            description: string;
                        } | {
                            name: string;
                            in: "query";
                            required: false;
                            schema: {
                                type: "string";
                                format: string;
                                minimum?: undefined;
                                items?: undefined;
                            };
                            description: string;
                        } | {
                            name: string;
                            in: "query";
                            required: false;
                            schema: {
                                type: "integer";
                                minimum: number;
                                format?: undefined;
                                items?: undefined;
                            };
                            description: string;
                        } | {
                            name: string;
                            in: "query";
                            required: false;
                            schema: {
                                type: "array";
                                items: {
                                    type: "string";
                                };
                                format?: undefined;
                                minimum?: undefined;
                            };
                            description: string;
                        })[];
                        responses: {
                            "302": {
                                description: string;
                                headers: {
                                    Location: {
                                        description: string;
                                        schema: {
                                            type: string;
                                            format: string;
                                        };
                                    };
                                };
                            };
                            "400": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                                state: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                redirect: true;
                url: string;
            }>;
            oauth2Consent: import("better-auth").StrictEndpoint<"/oauth2/consent", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    accept: import("better-auth").ZodBoolean;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    claims: import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>]>>;
                    oauth_query: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                redirect_uri: {
                                                    type: string;
                                                    format: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                redirect: true;
                url: string;
            } | {
                redirect: boolean;
                url: string;
            }>;
            oauth2Continue: import("better-auth").StrictEndpoint<"/oauth2/continue", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    selected: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    created: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    postLogin: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    oauth_query: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                redirect_uri: {
                                                    type: string;
                                                    format: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                redirect: true;
                url: string;
            }>;
            oauth2Token: import("better-auth").StrictEndpoint<"/oauth2/token", {
                method: "POST";
                cloneRequest: true;
                body: import("better-auth").ZodObject<{
                    grant_type: import("better-auth").ZodString;
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_secret: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion_type: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    code: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    code_verifier: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    redirect_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    refresh_token: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    resource: import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodArray<import("better-auth").ZodString>]>>;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$loose>;
                errorCodesByField: {
                    grant_type: {
                        missing: "invalid_request";
                        invalid: "unsupported_grant_type";
                    };
                    resource: {
                        invalid: "invalid_target";
                    };
                };
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        parameters: {
                            name: string;
                            in: "header";
                            required: false;
                            schema: {
                                type: "string";
                            };
                            description: string;
                        }[];
                        requestBody: {
                            required: boolean;
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object";
                                        properties: {
                                            grant_type: {
                                                type: string;
                                                description: string;
                                            };
                                            client_id: {
                                                type: string;
                                                description: string;
                                            };
                                            client_secret: {
                                                type: string;
                                                description: string;
                                            };
                                            code: {
                                                type: string;
                                                description: string;
                                            };
                                            code_verifier: {
                                                type: string;
                                                description: string;
                                            };
                                            redirect_uri: {
                                                type: string;
                                                format: string;
                                                description: string;
                                            };
                                            refresh_token: {
                                                type: string;
                                                description: string;
                                            };
                                            resource: {
                                                oneOf: ({
                                                    type: string;
                                                    description: string;
                                                    items?: undefined;
                                                } | {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                })[];
                                                description: string;
                                            };
                                            scope: {
                                                type: string;
                                                description: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                        };
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                access_token: {
                                                    type: string;
                                                    description: string;
                                                };
                                                token_type: {
                                                    type: string;
                                                    description: string;
                                                    enum: string[];
                                                };
                                                expires_in: {
                                                    type: string;
                                                    description: string;
                                                };
                                                refresh_token: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                id_token: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            "400": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                                error_uri: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                expires_in: number;
                access_token: string;
                expires_at: number;
                token_type: import("@better-auth/oauth-provider/*").TokenType;
                refresh_token: string | undefined;
                scope: string;
                id_token: string | undefined;
            }>;
            oauth2Introspect: import("better-auth").StrictEndpoint<"/oauth2/introspect", {
                method: "POST";
                cloneRequest: true;
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_secret: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion_type: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    token: import("better-auth").ZodString;
                    token_type_hint: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        requestBody: {
                            required: boolean;
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object";
                                        properties: {
                                            client_id: {
                                                type: string;
                                                description: string;
                                            };
                                            client_secret: {
                                                type: string;
                                                description: string;
                                            };
                                            token: {
                                                type: string;
                                                description: string;
                                            };
                                            token_type_hint: {
                                                type: string;
                                                description: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                        };
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                active: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                username: {
                                                    type: string;
                                                    description: string;
                                                };
                                                token_type: {
                                                    type: string;
                                                    description: string;
                                                };
                                                exp: {
                                                    type: string;
                                                    description: string;
                                                };
                                                iat: {
                                                    type: string;
                                                    description: string;
                                                };
                                                nbf: {
                                                    type: string;
                                                    description: string;
                                                };
                                                sub: {
                                                    type: string;
                                                    description: string;
                                                };
                                                aud: {
                                                    type: string;
                                                    description: string;
                                                };
                                                iss: {
                                                    type: string;
                                                    description: string;
                                                };
                                                jti: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            "400": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                                error_uri: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("better-auth").JWTPayload>;
            oauth2Revoke: import("better-auth").StrictEndpoint<"/oauth2/revoke", {
                method: "POST";
                cloneRequest: true;
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_secret: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion_type: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    token: import("better-auth").ZodString;
                    token_type_hint: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        requestBody: {
                            required: boolean;
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object";
                                        properties: {
                                            client_id: {
                                                type: string;
                                                description: string;
                                            };
                                            client_secret: {
                                                type: string;
                                                description: string;
                                            };
                                            token: {
                                                type: string;
                                                description: string;
                                            };
                                            token_type_hint: {
                                                type: string;
                                                description: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                        };
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            description: string;
                                        };
                                    };
                                };
                            };
                            "400": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                                error_uri: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, null | undefined>;
            oauth2UserInfo: import("better-auth").StrictEndpoint<"/oauth2/userinfo", {
                method: ("GET" | "POST")[];
                body: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    access_token: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$loose>>;
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        security: ({
                            bearerAuth: never[];
                            OAuth2?: undefined;
                        } | {
                            OAuth2: string[];
                            bearerAuth?: undefined;
                        })[];
                        parameters: {
                            name: string;
                            in: "header";
                            required: false;
                            schema: {
                                type: "string";
                            };
                            description: string;
                        }[];
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                sub: {
                                                    type: string;
                                                    description: string;
                                                };
                                                email: {
                                                    type: string;
                                                    format: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                name: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                picture: {
                                                    type: string;
                                                    format: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                given_name: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                family_name: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                email_verified: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            "401": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            "403": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                sub: unknown;
            }>;
            oauth2EndSession: import("better-auth").StrictEndpoint<"/oauth2/end-session", {
                method: ("GET" | "POST")[];
                body: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    id_token_hint: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    state: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>>;
                query: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    id_token_hint: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    state: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>>;
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    $Infer: {
                        body: {
                            id_token_hint?: string;
                            client_id?: string;
                            post_logout_redirect_uri?: string;
                            state?: string;
                        } | {
                            query: {
                                id_token_hint?: string;
                                client_id?: string;
                                post_logout_redirect_uri?: string;
                                state?: string;
                            };
                        };
                        query: {
                            id_token_hint?: string;
                            client_id?: string;
                            post_logout_redirect_uri?: string;
                            state?: string;
                        };
                    };
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                redirect_uri: {
                                                    type: string;
                                                    format: string;
                                                    description: string;
                                                };
                                                message: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                        };
                                    };
                                    "text/html": {
                                        schema: {
                                            type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, Response | {
                redirect: true;
                url: string;
            } | null>;
            oauth2EndSessionConfirmation: import("better-auth").StrictEndpoint<"/oauth2/end-session/confirm", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    action: import("better-auth").ZodLiteral<"confirm">;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    scope: "http";
                };
            }, Response | {
                redirect: true;
                url: string;
            } | null>;
            registerOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/register", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    token_endpoint_auth_method: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    jwks: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                        keys: import("better-auth").ZodArray<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                    }, import("zod/v4/core").$strip>>;
                    jwks_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                        code: "code";
                    }>>>;
                    application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        web: "web";
                        native: "native";
                    }>>;
                    subject_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        public: "public";
                        pairwise: "pairwise";
                    }>>;
                    dpop_bound_access_tokens: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    resources: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    skip_consent: import("better-auth").ZodOptional<import("better-auth").ZodNever>;
                }, import("zod/v4/core").$strip>;
                errorCodesByField: {
                    redirect_uris: "invalid_redirect_uri";
                    post_logout_redirect_uris: "invalid_redirect_uri";
                    software_statement: "invalid_software_statement";
                    resources: "invalid_target";
                };
                defaultError: "invalid_client_metadata";
                metadata: {
                    noStore: boolean;
                    openapi: {
                        description: string;
                        responses: {
                            "201": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                client_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret_expires_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                user_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_id_issued_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_name: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                logo_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                contacts: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                tos_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                policy_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_version: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_statement: {
                                                    type: string;
                                                    description: string;
                                                };
                                                redirect_uris: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                post_logout_redirect_uris: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                backchannel_logout_uri: {
                                                    type: string;
                                                    format: string;
                                                    description: string;
                                                };
                                                backchannel_logout_session_required: {
                                                    type: string;
                                                    description: string;
                                                };
                                                token_endpoint_auth_method: {
                                                    type: string;
                                                    description: string;
                                                };
                                                grant_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                response_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        enum: string[];
                                                    };
                                                    description: string;
                                                };
                                                application_type: {
                                                    type: string;
                                                    description: string;
                                                    enum: string[];
                                                };
                                                resources: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                disabled: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientRegistrationResponse>;
            adminCreateOAuthClient: import("better-auth").StrictEndpoint<"/admin/oauth2/create-client", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    token_endpoint_auth_method: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        web: "web";
                        native: "native";
                    }>>;
                    jwks: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                        keys: import("better-auth").ZodArray<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                    }, import("zod/v4/core").$strip>>;
                    jwks_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    client_credentials_scopes: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                        code: "code";
                    }>>>;
                    client_secret_expires_at: import("better-auth").ZodDefault<import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodNumber]>>>;
                    skip_consent: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    enable_end_session: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    require_pkce: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    dpop_bound_access_tokens: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    subject_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        public: "public";
                        pairwise: "pairwise";
                    }>>;
                    metadata: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    SERVER_ONLY: true;
                    openapi: {
                        description: string;
                        responses: {
                            "201": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                client_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret_expires_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_credentials_scopes: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                user_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_id_issued_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_name: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                logo_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                contacts: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                tos_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                policy_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_version: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_statement: {
                                                    type: string;
                                                    description: string;
                                                };
                                                redirect_uris: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                token_endpoint_auth_method: {
                                                    type: string;
                                                    description: string;
                                                };
                                                grant_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                response_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        enum: string[];
                                                    };
                                                    description: string;
                                                };
                                                application_type: {
                                                    type: string;
                                                    description: string;
                                                    enum: string[];
                                                };
                                                resources: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                disabled: {
                                                    type: string;
                                                    description: string;
                                                };
                                                require_pkce: {
                                                    type: string;
                                                    description: string;
                                                    default: boolean;
                                                };
                                                metadata: {
                                                    type: string;
                                                    additionalProperties: boolean;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientAdministrativeResponse>;
            createOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/create-client", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    token_endpoint_auth_method: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        web: "web";
                        native: "native";
                    }>>;
                    jwks: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                        keys: import("better-auth").ZodArray<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                    }, import("zod/v4/core").$strip>>;
                    jwks_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                        code: "code";
                    }>>>;
                    dpop_bound_access_tokens: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    openapi: {
                        description: string;
                        responses: {
                            "201": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                client_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret_expires_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                user_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_id_issued_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_name: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                logo_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                contacts: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                tos_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                policy_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_version: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_statement: {
                                                    type: string;
                                                    description: string;
                                                };
                                                redirect_uris: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                token_endpoint_auth_method: {
                                                    type: string;
                                                    description: string;
                                                };
                                                grant_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                response_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        enum: string[];
                                                    };
                                                    description: string;
                                                };
                                                application_type: {
                                                    type: string;
                                                    description: string;
                                                    enum: string[];
                                                };
                                                resources: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                disabled: {
                                                    type: string;
                                                    description: string;
                                                };
                                                metadata: {
                                                    type: string;
                                                    additionalProperties: boolean;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientRegistrationResponse>;
            getOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/get-client", {
                method: "GET";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                query: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient>;
            getOAuthClientPublic: import("better-auth").StrictEndpoint<"/oauth2/public-client", {
                method: "GET";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                query: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient>;
            getOAuthClientPublicPrelogin: import("better-auth").StrictEndpoint<"/oauth2/public-client-prelogin", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>[];
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                    oauth_query: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient>;
            getOAuthClients: import("better-auth").StrictEndpoint<"/oauth2/get-clients", {
                method: "GET";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient[] | null>;
            adminUpdateOAuthClient: import("better-auth").StrictEndpoint<"/admin/oauth2/update-client", {
                method: "PATCH";
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                    update: import("better-auth").ZodObject<{
                        redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                        scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                        backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                        backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                            web: "web";
                            native: "native";
                        }>>;
                        grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        client_credentials_scopes: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                            code: "code";
                        }>>>;
                        client_secret_expires_at: import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodNumber]>>;
                        skip_consent: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        enable_end_session: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        dpop_bound_access_tokens: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        metadata: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                    }, import("zod/v4/core").$strip>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    SERVER_ONLY: true;
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientAdministrativeResponse>;
            updateOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/update-client", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                    update: import("better-auth").ZodObject<{
                        redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                        scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                        backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                        backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                            web: "web";
                            native: "native";
                        }>>;
                        grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                            code: "code";
                        }>>>;
                    }, import("zod/v4/core").$strip>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientRegistrationResponse>;
            rotateClientSecret: import("better-auth").StrictEndpoint<"/oauth2/client/rotate-secret", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient>;
            deleteOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/delete-client", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, void>;
            getOAuthConsent: import("better-auth").StrictEndpoint<"/oauth2/get-consent", {
                method: "GET";
                query: import("better-auth").ZodObject<{
                    id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthConsent<import("@better-auth/oauth-provider/*").Scope[]>>;
            getOAuthConsents: import("better-auth").StrictEndpoint<"/oauth2/get-consents", {
                method: "GET";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthConsent<import("@better-auth/oauth-provider/*").Scope[]>[]>;
            updateOAuthConsent: import("better-auth").StrictEndpoint<"/oauth2/update-consent", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    id: import("better-auth").ZodString;
                    update: import("better-auth").ZodObject<{
                        scopes: import("better-auth").ZodArray<import("better-auth").ZodString>;
                    }, import("zod/v4/core").$strip>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthConsent<import("@better-auth/oauth-provider/*").Scope[]> | null>;
            deleteOAuthConsent: import("better-auth").StrictEndpoint<"/oauth2/delete-consent", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, void>;
            adminCreateOAuthResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    identifier: import("better-auth").ZodNonOptional<import("better-auth").ZodOptional<import("better-auth").ZodString>>;
                    name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    accessTokenTtl: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodNumber>>;
                    refreshTokenTtl: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodNumber>>;
                    signingAlgorithm: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodEnum<{
                        RS256: "RS256";
                        PS256: "PS256";
                        ES256: "ES256";
                        ES512: "ES512";
                        EdDSA: "EdDSA";
                    }>>>;
                    signingKeyId: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodString>>;
                    allowedScopes: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodArray<import("better-auth").ZodString>>>;
                    customClaims: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>>;
                    dpopBoundAccessTokensRequired: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    disabled: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    metadata: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").OAuthResource>;
            adminListOAuthResources: import("better-auth").StrictEndpoint<"/admin/oauth2/resources", {
                method: "GET";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").OAuthResource[]>;
            adminGetOAuthResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier", {
                method: "GET";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").OAuthResource>;
            adminUpdateOAuthResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier", {
                method: "PATCH";
                body: import("better-auth").ZodObject<{
                    identifier: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    accessTokenTtl: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodNumber>>;
                    refreshTokenTtl: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodNumber>>;
                    signingAlgorithm: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodEnum<{
                        RS256: "RS256";
                        PS256: "PS256";
                        ES256: "ES256";
                        ES512: "ES512";
                        EdDSA: "EdDSA";
                    }>>>;
                    signingKeyId: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodString>>;
                    allowedScopes: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodArray<import("better-auth").ZodString>>>;
                    customClaims: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>>;
                    dpopBoundAccessTokensRequired: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    disabled: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    metadata: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").OAuthResource>;
            adminDeleteOAuthResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier", {
                method: "DELETE";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, {
                deleted: boolean;
            }>;
            adminLinkClientResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier/clients/:client_id", {
                method: "POST";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, {
                linked: boolean;
            }>;
            adminUnlinkClientResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier/clients/:client_id", {
                method: "DELETE";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, {
                unlinked: boolean;
            }>;
        };
        schema: {
            oauthClient: {
                modelName: string;
                fields: {
                    clientId: {
                        type: "string";
                        unique: true;
                        required: true;
                    };
                    clientSecret: {
                        type: "string";
                        required: false;
                    };
                    clientDiscoveryId: {
                        type: "string";
                        required: false;
                    };
                    disabled: {
                        type: "boolean";
                        defaultValue: false;
                        required: false;
                    };
                    skipConsent: {
                        type: "boolean";
                        required: false;
                    };
                    enableEndSession: {
                        type: "boolean";
                        required: false;
                    };
                    subjectType: {
                        type: "string";
                        required: false;
                    };
                    scopes: {
                        type: "string[]";
                        required: false;
                    };
                    clientCredentialsScopes: {
                        type: "string[]";
                        required: false;
                        defaultValue: never[];
                    };
                    userId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    createdAt: {
                        type: "date";
                        required: false;
                    };
                    updatedAt: {
                        type: "date";
                        required: false;
                    };
                    name: {
                        type: "string";
                        required: false;
                    };
                    uri: {
                        type: "string";
                        required: false;
                    };
                    icon: {
                        type: "string";
                        required: false;
                    };
                    contacts: {
                        type: "string[]";
                        required: false;
                    };
                    tos: {
                        type: "string";
                        required: false;
                    };
                    policy: {
                        type: "string";
                        required: false;
                    };
                    softwareId: {
                        type: "string";
                        required: false;
                    };
                    softwareVersion: {
                        type: "string";
                        required: false;
                    };
                    softwareStatement: {
                        type: "string";
                        required: false;
                    };
                    redirectUris: {
                        type: "string[]";
                        required: true;
                    };
                    postLogoutRedirectUris: {
                        type: "string[]";
                        required: false;
                    };
                    backchannelLogoutUri: {
                        type: "string";
                        required: false;
                    };
                    backchannelLogoutSessionRequired: {
                        type: "boolean";
                        required: false;
                    };
                    tokenEndpointAuthMethod: {
                        type: "string";
                        required: false;
                    };
                    applicationType: {
                        type: "string";
                        required: false;
                    };
                    jwks: {
                        type: "string";
                        required: false;
                    };
                    jwksUri: {
                        type: "string";
                        required: false;
                    };
                    grantTypes: {
                        type: "string[]";
                        required: false;
                    };
                    responseTypes: {
                        type: "string[]";
                        required: false;
                    };
                    requirePKCE: {
                        type: "boolean";
                        required: false;
                    };
                    dpopBoundAccessTokens: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                    };
                    referenceId: {
                        type: "string";
                        required: false;
                    };
                    metadata: {
                        type: "json";
                        required: false;
                    };
                };
            };
            oauthResource: {
                modelName: string;
                fields: {
                    identifier: {
                        type: "string";
                        required: true;
                        unique: true;
                    };
                    name: {
                        type: "string";
                        required: true;
                    };
                    accessTokenTtl: {
                        type: "number";
                        required: false;
                    };
                    refreshTokenTtl: {
                        type: "number";
                        required: false;
                    };
                    signingAlgorithm: {
                        type: "string";
                        required: false;
                    };
                    signingKeyId: {
                        type: "string";
                        required: false;
                    };
                    allowedScopes: {
                        type: "string[]";
                        required: false;
                    };
                    customClaims: {
                        type: "json";
                        required: false;
                    };
                    dpopBoundAccessTokensRequired: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                    };
                    disabled: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                    };
                    createdAt: {
                        type: "date";
                        required: false;
                    };
                    updatedAt: {
                        type: "date";
                        required: false;
                    };
                    policyVersion: {
                        type: "number";
                        required: false;
                        defaultValue: number;
                    };
                    metadata: {
                        type: "json";
                        required: false;
                    };
                };
            };
            oauthClientResource: {
                modelName: string;
                fields: {
                    clientId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                            onDelete: "cascade";
                        };
                        index: true;
                    };
                    resourceId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                            onDelete: "cascade";
                        };
                        index: true;
                    };
                    metadata: {
                        type: "json";
                        required: false;
                    };
                    createdAt: {
                        type: "date";
                        required: false;
                    };
                };
                indexes: {
                    fields: [string, string];
                    unique: true;
                }[];
            };
            oauthRefreshToken: {
                fields: {
                    token: {
                        type: "string";
                        required: true;
                        unique: true;
                    };
                    clientId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    sessionId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                            onDelete: "set null";
                        };
                        index: true;
                    };
                    userId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    referenceId: {
                        type: "string";
                        required: false;
                    };
                    authorizationCodeId: {
                        type: "string";
                        required: false;
                        index: true;
                    };
                    resources: {
                        type: "string[]";
                        required: false;
                    };
                    requestedUserInfoClaims: {
                        type: "string[]";
                        required: false;
                    };
                    expiresAt: {
                        type: "date";
                    };
                    createdAt: {
                        type: "date";
                    };
                    revoked: {
                        type: "date";
                        required: false;
                    };
                    rotatedAt: {
                        type: "date";
                        required: false;
                    };
                    rotationReplayResponse: {
                        type: "string";
                        required: false;
                    };
                    rotationReplayExpiresAt: {
                        type: "date";
                        required: false;
                    };
                    authTime: {
                        type: "date";
                        required: false;
                    };
                    confirmation: {
                        type: "json";
                        required: false;
                    };
                    scopes: {
                        type: "string[]";
                        required: true;
                    };
                };
            };
            oauthAccessToken: {
                modelName: string;
                fields: {
                    token: {
                        type: "string";
                        unique: true;
                    };
                    clientId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    sessionId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                            onDelete: "set null";
                        };
                        index: true;
                    };
                    userId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    referenceId: {
                        type: "string";
                        required: false;
                    };
                    authorizationCodeId: {
                        type: "string";
                        required: false;
                        index: true;
                    };
                    resources: {
                        type: "string[]";
                        required: false;
                    };
                    requestedUserInfoClaims: {
                        type: "string[]";
                        required: false;
                    };
                    refreshId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    expiresAt: {
                        type: "date";
                    };
                    createdAt: {
                        type: "date";
                    };
                    revoked: {
                        type: "date";
                        required: false;
                    };
                    confirmation: {
                        type: "json";
                        required: false;
                    };
                    scopes: {
                        type: "string[]";
                        required: true;
                    };
                };
            };
            oauthConsent: {
                modelName: string;
                fields: {
                    clientId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    userId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    referenceId: {
                        type: "string";
                        required: false;
                    };
                    resources: {
                        type: "string[]";
                        required: false;
                    };
                    requestedUserInfoClaims: {
                        type: "string[]";
                        required: false;
                    };
                    scopes: {
                        type: "string[]";
                        required: true;
                    };
                    createdAt: {
                        type: "date";
                    };
                    updatedAt: {
                        type: "date";
                    };
                };
            };
            oauthClientAssertion: {
                modelName: string;
                fields: {
                    expiresAt: {
                        type: "date";
                        required: true;
                    };
                };
            };
        };
        rateLimit: ({
            pathMatcher: (path: string) => path is "/oauth2/token";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/authorize";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/introspect";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/revoke";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/register";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/userinfo";
            window: number;
            max: number;
        })[];
    } | {
        id: "cimd";
        version: string;
        init(ctx: import("better-auth").AuthContext): void;
    } | {
        id: "stripe";
        version: string;
        endpoints: {
            stripeWebhook: import("better-auth").StrictEndpoint<"/stripe/webhook", {
                method: "POST";
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                    scope: "server";
                };
                cloneRequest: true;
                disableBody: true;
            }, {
                success: boolean;
            }>;
        } & {
            upgradeSubscription: import("better-auth").StrictEndpoint<"/subscription/upgrade", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    plan: import("better-auth").ZodString;
                    annual: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    subscriptionId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                    metadata: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                    seats: import("better-auth").ZodOptional<import("better-auth").ZodNumber>;
                    locale: import("better-auth").ZodOptional<import("better-auth").ZodCustom<import("@better-auth/stripe").CheckoutSessionLocale, import("@better-auth/stripe").CheckoutSessionLocale>>;
                    successUrl: import("better-auth").ZodDefault<import("better-auth").ZodString>;
                    cancelUrl: import("better-auth").ZodDefault<import("better-auth").ZodString>;
                    returnUrl: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    scheduleAtPeriodEnd: import("better-auth").ZodDefault<import("better-auth").ZodBoolean>;
                    disableRedirect: import("better-auth").ZodDefault<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>)[];
            }, {
                url: string;
                redirect: boolean;
            } | (import("stripe").Stripe.Checkout.Session & {
                lastResponse: {
                    headers: {
                        [key: string]: string;
                    };
                    requestId: string;
                    statusCode: number;
                    apiVersion?: string;
                    idempotencyKey?: string;
                    stripeAccount?: string;
                };
            } & {
                redirect: boolean;
            })>;
            cancelSubscription: import("better-auth").StrictEndpoint<"/subscription/cancel", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    subscriptionId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                    returnUrl: import("better-auth").ZodString;
                    disableRedirect: import("better-auth").ZodDefault<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>)[];
            }, {
                url: string;
                redirect: boolean;
            }>;
            restoreSubscription: import("better-auth").StrictEndpoint<"/subscription/restore", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    subscriptionId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>>)[];
            }, import("stripe").Stripe.Response<import("stripe").Stripe.Subscription>>;
            listActiveSubscriptions: import("better-auth").StrictEndpoint<"/subscription/list", {
                method: "GET";
                query: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                }, import("zod/v4/core").$strip>>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>>)[];
            }, {
                limits: Record<string, unknown> | undefined;
                priceId: string | undefined;
                id: string;
                plan: string;
                stripeCustomerId?: string | undefined;
                stripeSubscriptionId?: string | undefined;
                trialStart?: Date | undefined;
                trialEnd?: Date | undefined;
                referenceId: string;
                status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                periodStart?: Date | undefined;
                periodEnd?: Date | undefined;
                cancelAtPeriodEnd?: boolean | undefined;
                cancelAt?: Date | undefined;
                canceledAt?: Date | undefined;
                endedAt?: Date | undefined;
                groupId?: string | undefined;
                seats?: number | undefined;
                billingInterval?: "day" | "week" | "month" | "year" | undefined;
                stripeScheduleId?: string | undefined;
            }[]>;
            subscriptionSuccess: import("better-auth").StrictEndpoint<"/subscription/success", {
                method: "GET";
                query: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>[];
            }, never>;
            createBillingPortal: import("better-auth").StrictEndpoint<"/subscription/billing-portal", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    locale: import("better-auth").ZodOptional<import("better-auth").ZodCustom<import("@better-auth/stripe").CheckoutSessionLocale, import("@better-auth/stripe").CheckoutSessionLocale>>;
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                    returnUrl: import("better-auth").ZodDefault<import("better-auth").ZodString>;
                    disableRedirect: import("better-auth").ZodDefault<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>)[];
            }, {
                url: string;
                redirect: boolean;
            }>;
        };
        init(ctx: import("better-auth").AuthContext): {
            options: {
                databaseHooks: {
                    user: {
                        create: {
                            after(user: import("better-auth").User & import("@better-auth/stripe").WithStripeCustomerId, ctx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                        };
                        update: {
                            after(user: import("better-auth").User & import("@better-auth/stripe").WithStripeCustomerId, ctx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                        };
                    };
                };
            };
        } | undefined;
        schema: {
            user: {
                fields: {
                    stripeCustomerId: {
                        type: "string";
                        required: false;
                    };
                };
            };
        } & {
            subscription: {
                fields: {
                    plan: {
                        type: "string";
                        required: true;
                    };
                    referenceId: {
                        type: "string";
                        required: true;
                    };
                    stripeCustomerId: {
                        type: "string";
                        required: false;
                    };
                    stripeSubscriptionId: {
                        type: "string";
                        required: false;
                    };
                    status: {
                        type: "string";
                        defaultValue: string;
                    };
                    periodStart: {
                        type: "date";
                        required: false;
                    };
                    periodEnd: {
                        type: "date";
                        required: false;
                    };
                    trialStart: {
                        type: "date";
                        required: false;
                    };
                    trialEnd: {
                        type: "date";
                        required: false;
                    };
                    cancelAtPeriodEnd: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                    };
                    cancelAt: {
                        type: "date";
                        required: false;
                    };
                    canceledAt: {
                        type: "date";
                        required: false;
                    };
                    endedAt: {
                        type: "date";
                        required: false;
                    };
                    seats: {
                        type: "number";
                        required: false;
                    };
                    billingInterval: {
                        type: "string";
                        required: false;
                    };
                    stripeScheduleId: {
                        type: "string";
                        required: false;
                    };
                };
            };
        };
        options: NoInfer<{
            stripeClient: import("stripe").Stripe;
            stripeWebhookSecret: string;
            subscription: {
                enabled: true;
                plans: {
                    name: string;
                    priceId: string;
                }[];
                onSubscriptionComplete: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                    plan: import("@better-auth/stripe").StripePlan;
                }) => Promise<void>;
                onSubscriptionCreated: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                    plan: import("@better-auth/stripe").StripePlan;
                }) => Promise<void>;
                onSubscriptionUpdate: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                }) => Promise<void>;
                onSubscriptionCancel: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                    cancellationDetails?: import("stripe").Stripe.Subscription.CancellationDetails | null;
                }) => Promise<void>;
                onSubscriptionDeleted: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                }) => Promise<void>;
            };
        }>;
        $ERROR_CODES: {
            UNAUTHORIZED: import("better-auth").RawError<"UNAUTHORIZED">;
            INVALID_REQUEST_BODY: import("better-auth").RawError<"INVALID_REQUEST_BODY">;
            SUBSCRIPTION_NOT_FOUND: import("better-auth").RawError<"SUBSCRIPTION_NOT_FOUND">;
            SUBSCRIPTION_PLAN_NOT_FOUND: import("better-auth").RawError<"SUBSCRIPTION_PLAN_NOT_FOUND">;
            ALREADY_SUBSCRIBED_PLAN: import("better-auth").RawError<"ALREADY_SUBSCRIBED_PLAN">;
            REFERENCE_ID_NOT_ALLOWED: import("better-auth").RawError<"REFERENCE_ID_NOT_ALLOWED">;
            CUSTOMER_NOT_FOUND: import("better-auth").RawError<"CUSTOMER_NOT_FOUND">;
            UNABLE_TO_CREATE_CUSTOMER: import("better-auth").RawError<"UNABLE_TO_CREATE_CUSTOMER">;
            UNABLE_TO_CREATE_BILLING_PORTAL: import("better-auth").RawError<"UNABLE_TO_CREATE_BILLING_PORTAL">;
            STRIPE_SIGNATURE_NOT_FOUND: import("better-auth").RawError<"STRIPE_SIGNATURE_NOT_FOUND">;
            STRIPE_WEBHOOK_SECRET_NOT_FOUND: import("better-auth").RawError<"STRIPE_WEBHOOK_SECRET_NOT_FOUND">;
            STRIPE_WEBHOOK_ERROR: import("better-auth").RawError<"STRIPE_WEBHOOK_ERROR">;
            FAILED_TO_CONSTRUCT_STRIPE_EVENT: import("better-auth").RawError<"FAILED_TO_CONSTRUCT_STRIPE_EVENT">;
            FAILED_TO_FETCH_PLANS: import("better-auth").RawError<"FAILED_TO_FETCH_PLANS">;
            EMAIL_VERIFICATION_REQUIRED: import("better-auth").RawError<"EMAIL_VERIFICATION_REQUIRED">;
            SUBSCRIPTION_NOT_ACTIVE: import("better-auth").RawError<"SUBSCRIPTION_NOT_ACTIVE">;
            SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION: import("better-auth").RawError<"SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION">;
            SUBSCRIPTION_NOT_PENDING_CHANGE: import("better-auth").RawError<"SUBSCRIPTION_NOT_PENDING_CHANGE">;
            ORGANIZATION_NOT_FOUND: import("better-auth").RawError<"ORGANIZATION_NOT_FOUND">;
            ORGANIZATION_SUBSCRIPTION_NOT_ENABLED: import("better-auth").RawError<"ORGANIZATION_SUBSCRIPTION_NOT_ENABLED">;
            AUTHORIZE_REFERENCE_REQUIRED: import("better-auth").RawError<"AUTHORIZE_REFERENCE_REQUIRED">;
            ORGANIZATION_HAS_ACTIVE_SUBSCRIPTION: import("better-auth").RawError<"ORGANIZATION_HAS_ACTIVE_SUBSCRIPTION">;
            ORGANIZATION_REFERENCE_ID_REQUIRED: import("better-auth").RawError<"ORGANIZATION_REFERENCE_ID_REQUIRED">;
        };
    })[];
    session: {
        cookieCache: {
            enabled: true;
            maxAge: number;
        };
    };
    account: {
        accountLinking: {
            enabled: true;
            trustedProviders: ("github" | "discord" | "google")[];
        };
    };
    emailAndPassword: {
        enabled: true;
        minPasswordLength: number;
        requireEmailVerification: boolean;
        sendResetPassword: ({ user, url }: {
            user: import("better-auth").User;
            url: string;
            token: string;
        }) => Promise<void>;
    };
    emailVerification: {
        sendOnSignUp: boolean;
        autoSignInAfterVerification: true;
        sendVerificationEmail: ({ user, url }: {
            user: import("better-auth").User;
            url: string;
            token: string;
        }) => Promise<void>;
    };
    socialProviders: {
        google: {
            clientId: string;
            clientSecret: string;
            enabled: boolean;
        };
        github: {
            clientId: string;
            clientSecret: string;
            enabled: boolean;
            scope: string[];
        };
        discord: {
            clientId: string;
            clientSecret: string;
            enabled: boolean;
            scope: string[];
        };
    };
    trustedOrigins: string[];
}>;
export type AuthInstance = typeof pluginAuth;
export declare const authInstance: Auth<{
    database: any;
    baseURL: string | {
        allowedHosts: string[];
        fallback: string;
        protocol: "http" | "https";
    };
    basePath: string;
    secret: string;
    logger: {
        level: "debug";
    };
    telemetry: {
        enabled: false;
    };
    plugins: ({
        id: "jwt";
        version: string;
        options: NoInfer<import("better-auth/plugins").JwtOptions>;
        init(ctx: import("better-auth").AuthContext): {
            context: {
                sessionConfig: {
                    cookieCacheSigner: import("better-auth").CookieCacheSigner;
                    updateAge: number;
                    expiresIn: number;
                    freshAge: number;
                    cookieRefreshCache: false | {
                        enabled: true;
                        updateAge: number;
                    };
                };
            };
        } | undefined;
        endpoints: {
            getJwks: import("better-auth").StrictEndpoint<string, {
                method: "GET";
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                keys: {
                                                    type: string;
                                                    description: string;
                                                    items: {
                                                        type: string;
                                                        properties: {
                                                            kid: {
                                                                type: string;
                                                                description: string;
                                                            };
                                                            kty: {
                                                                type: string;
                                                                description: string;
                                                            };
                                                            alg: {
                                                                type: string;
                                                                description: string;
                                                            };
                                                            use: {
                                                                type: string;
                                                                description: string;
                                                                enum: string[];
                                                                nullable: boolean;
                                                            };
                                                            n: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                            e: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                            crv: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                            x: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                            y: {
                                                                type: string;
                                                                description: string;
                                                                nullable: boolean;
                                                            };
                                                        };
                                                        required: string[];
                                                    };
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("better-auth").JSONWebKeySet>;
            getToken: import("better-auth").StrictEndpoint<"/token", {
                method: "GET";
                requireHeaders: true;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                token: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                token: string;
            }>;
            signJWT: import("better-auth").StrictEndpoint<string, {
                method: "POST";
                metadata: {
                    $Infer: {
                        body: {
                            payload: import("better-auth").JWTPayload;
                            overrideOptions?: import("better-auth/plugins").JwtOptions | undefined;
                        };
                    };
                };
                body: import("better-auth").ZodObject<{
                    payload: import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>;
                    overrideOptions: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                }, import("zod/v4/core").$strip>;
            }, {
                token: string;
            }>;
            verifyJWT: import("better-auth").StrictEndpoint<string, {
                method: "POST";
                metadata: {
                    $Infer: {
                        body: {
                            token: string;
                            issuer?: string;
                        };
                        response: {
                            payload: {
                                sub: string;
                                aud: string;
                                [key: string]: any;
                            } | null;
                        };
                    };
                };
                body: import("better-auth").ZodObject<{
                    token: import("better-auth").ZodString;
                    issuer: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
            }, {
                payload: (import("better-auth").JWTPayload & Required<Pick<import("better-auth").JWTPayload, "sub" | "aud">>) | null;
            }>;
        };
        hooks: {
            after: {
                matcher(context: import("better-auth").HookEndpointContext): boolean;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>;
            }[];
        };
        schema: {
            jwks: {
                fields: {
                    publicKey: {
                        type: "string";
                        required: true;
                    };
                    privateKey: {
                        type: "string";
                        required: true;
                    };
                    createdAt: {
                        type: "date";
                        required: true;
                    };
                    expiresAt: {
                        type: "date";
                        required: false;
                    };
                    alg: {
                        type: "string";
                        required: false;
                    };
                    crv: {
                        type: "string";
                        required: false;
                    };
                };
            };
        };
    } | {
        id: "oauth-provider";
        version: string;
        options: NoInfer<import("@better-auth/oauth-provider/*").OAuthOptions<import("@better-auth/oauth-provider/*").Scope[]>>;
        onRequest: (request: Request, ctx: import("better-auth").AuthContext) => Promise<{
            response: Response;
        } | {
            request: Request;
        } | void>;
        init: (ctx: import("better-auth").AuthContext) => Promise<{
            options: {
                databaseHooks: {
                    session: {
                        delete: {
                            before(session: {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            } & Record<string, unknown>, hookCtx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                            after(session: {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            } & Record<string, unknown>, hookCtx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                        };
                    };
                };
            };
        }>;
        hooks: {
            before: {
                matcher(ctx: import("better-auth").HookEndpointContext): any;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>;
            }[];
            after: {
                matcher(ctx: import("better-auth").HookEndpointContext): boolean;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    redirect: true;
                    url: string;
                } | undefined>>;
            }[];
        };
        endpoints: {
            getOAuthServerConfig: import("better-auth").StrictEndpoint<"/.well-known/oauth-authorization-server", {
                method: "GET";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").AuthServerMetadata>;
            getOpenIdConfig: import("better-auth").StrictEndpoint<"/.well-known/openid-configuration", {
                method: "GET";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, {
                jwks_uri?: string | undefined;
                userinfo_endpoint: string;
                acr_values_supported?: string[] | undefined;
                subject_types_supported: ("public" | "pairwise")[];
                claims_supported: string[];
                claims_parameter_supported?: boolean | undefined;
                end_session_endpoint: string;
                request_parameter_supported?: boolean | undefined;
                request_uri_parameter_supported?: boolean | undefined;
                prompt_values_supported: import("@better-auth/oauth-provider/*").Prompt[];
                issuer: string;
                authorization_endpoint: string;
                token_endpoint: string;
                registration_endpoint?: string | undefined;
                scopes_supported?: string[] | undefined;
                response_types_supported: "code"[];
                response_modes_supported: "query"[];
                grant_types_supported: import("@better-auth/oauth-provider/*").GrantType[];
                token_endpoint_auth_methods_supported?: import("@better-auth/oauth-provider/*").TokenEndpointAuthMethod[] | undefined;
                token_endpoint_auth_signing_alg_values_supported?: import("better-auth").PrivateKeyJwtSigningAlgorithm[] | undefined;
                service_documentation?: string | undefined;
                ui_locales_supported?: string[] | undefined;
                op_policy_uri?: string | undefined;
                op_tos_uri?: string | undefined;
                revocation_endpoint?: string | undefined;
                revocation_endpoint_auth_methods_supported?: import("@better-auth/oauth-provider/*").TokenEndpointAuthMethod[] | undefined;
                revocation_endpoint_auth_signing_alg_values_supported?: import("better-auth").PrivateKeyJwtSigningAlgorithm[] | undefined;
                introspection_endpoint?: string | undefined;
                introspection_endpoint_auth_methods_supported?: import("@better-auth/oauth-provider/*").TokenEndpointAuthMethod[] | undefined;
                introspection_endpoint_auth_signing_alg_values_supported?: import("better-auth").PrivateKeyJwtSigningAlgorithm[] | undefined;
                code_challenge_methods_supported: "S256"[];
                authorization_response_iss_parameter_supported?: boolean | undefined;
                client_id_metadata_document_supported?: boolean | undefined;
                backchannel_logout_supported?: boolean | undefined;
                backchannel_logout_session_supported?: boolean | undefined;
                dpop_signing_alg_values_supported?: import("better-auth/plugins").JWSAlgorithms[] | undefined;
                id_token_signing_alg_values_supported: import("better-auth/plugins").JWSAlgorithms[] | ["HS256"];
            }>;
            oauth2Authorize: import("better-auth").StrictEndpoint<"/oauth2/authorize", {
                method: ("GET" | "POST")[];
                body: import("better-auth").ZodObject<{}, import("zod/v4/core").$loose>;
                redirectOnError: import("@better-auth/oauth-provider/*").OAuthRedirectOnError<import("better-auth").GenericEndpointContext, {
                    redirect: true;
                    url: string;
                }>;
                metadata: {
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        parameters: ({
                            name: string;
                            in: "query";
                            required: false;
                            schema: {
                                type: "string";
                                format?: undefined;
                                minimum?: undefined;
                                items?: undefined;
                            };
                            description: string;
                        } | {
                            name: string;
                            in: "query";
                            required: true;
                            schema: {
                                type: "string";
                                format?: undefined;
                                minimum?: undefined;
                                items?: undefined;
                            };
                            description: string;
                        } | {
                            name: string;
                            in: "query";
                            required: false;
                            schema: {
                                type: "string";
                                format: string;
                                minimum?: undefined;
                                items?: undefined;
                            };
                            description: string;
                        } | {
                            name: string;
                            in: "query";
                            required: false;
                            schema: {
                                type: "integer";
                                minimum: number;
                                format?: undefined;
                                items?: undefined;
                            };
                            description: string;
                        } | {
                            name: string;
                            in: "query";
                            required: false;
                            schema: {
                                type: "array";
                                items: {
                                    type: "string";
                                };
                                format?: undefined;
                                minimum?: undefined;
                            };
                            description: string;
                        })[];
                        responses: {
                            "302": {
                                description: string;
                                headers: {
                                    Location: {
                                        description: string;
                                        schema: {
                                            type: string;
                                            format: string;
                                        };
                                    };
                                };
                            };
                            "400": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                                state: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                redirect: true;
                url: string;
            }>;
            oauth2Consent: import("better-auth").StrictEndpoint<"/oauth2/consent", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    accept: import("better-auth").ZodBoolean;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    claims: import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>]>>;
                    oauth_query: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                redirect_uri: {
                                                    type: string;
                                                    format: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                redirect: true;
                url: string;
            } | {
                redirect: boolean;
                url: string;
            }>;
            oauth2Continue: import("better-auth").StrictEndpoint<"/oauth2/continue", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    selected: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    created: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    postLogin: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    oauth_query: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                redirect_uri: {
                                                    type: string;
                                                    format: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                redirect: true;
                url: string;
            }>;
            oauth2Token: import("better-auth").StrictEndpoint<"/oauth2/token", {
                method: "POST";
                cloneRequest: true;
                body: import("better-auth").ZodObject<{
                    grant_type: import("better-auth").ZodString;
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_secret: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion_type: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    code: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    code_verifier: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    redirect_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    refresh_token: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    resource: import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodArray<import("better-auth").ZodString>]>>;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$loose>;
                errorCodesByField: {
                    grant_type: {
                        missing: "invalid_request";
                        invalid: "unsupported_grant_type";
                    };
                    resource: {
                        invalid: "invalid_target";
                    };
                };
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        parameters: {
                            name: string;
                            in: "header";
                            required: false;
                            schema: {
                                type: "string";
                            };
                            description: string;
                        }[];
                        requestBody: {
                            required: boolean;
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object";
                                        properties: {
                                            grant_type: {
                                                type: string;
                                                description: string;
                                            };
                                            client_id: {
                                                type: string;
                                                description: string;
                                            };
                                            client_secret: {
                                                type: string;
                                                description: string;
                                            };
                                            code: {
                                                type: string;
                                                description: string;
                                            };
                                            code_verifier: {
                                                type: string;
                                                description: string;
                                            };
                                            redirect_uri: {
                                                type: string;
                                                format: string;
                                                description: string;
                                            };
                                            refresh_token: {
                                                type: string;
                                                description: string;
                                            };
                                            resource: {
                                                oneOf: ({
                                                    type: string;
                                                    description: string;
                                                    items?: undefined;
                                                } | {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                })[];
                                                description: string;
                                            };
                                            scope: {
                                                type: string;
                                                description: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                        };
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                access_token: {
                                                    type: string;
                                                    description: string;
                                                };
                                                token_type: {
                                                    type: string;
                                                    description: string;
                                                    enum: string[];
                                                };
                                                expires_in: {
                                                    type: string;
                                                    description: string;
                                                };
                                                refresh_token: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                id_token: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            "400": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                                error_uri: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                expires_in: number;
                access_token: string;
                expires_at: number;
                token_type: import("@better-auth/oauth-provider/*").TokenType;
                refresh_token: string | undefined;
                scope: string;
                id_token: string | undefined;
            }>;
            oauth2Introspect: import("better-auth").StrictEndpoint<"/oauth2/introspect", {
                method: "POST";
                cloneRequest: true;
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_secret: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion_type: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    token: import("better-auth").ZodString;
                    token_type_hint: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        requestBody: {
                            required: boolean;
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object";
                                        properties: {
                                            client_id: {
                                                type: string;
                                                description: string;
                                            };
                                            client_secret: {
                                                type: string;
                                                description: string;
                                            };
                                            token: {
                                                type: string;
                                                description: string;
                                            };
                                            token_type_hint: {
                                                type: string;
                                                description: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                        };
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                active: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                username: {
                                                    type: string;
                                                    description: string;
                                                };
                                                token_type: {
                                                    type: string;
                                                    description: string;
                                                };
                                                exp: {
                                                    type: string;
                                                    description: string;
                                                };
                                                iat: {
                                                    type: string;
                                                    description: string;
                                                };
                                                nbf: {
                                                    type: string;
                                                    description: string;
                                                };
                                                sub: {
                                                    type: string;
                                                    description: string;
                                                };
                                                aud: {
                                                    type: string;
                                                    description: string;
                                                };
                                                iss: {
                                                    type: string;
                                                    description: string;
                                                };
                                                jti: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            "400": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                                error_uri: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("better-auth").JWTPayload>;
            oauth2Revoke: import("better-auth").StrictEndpoint<"/oauth2/revoke", {
                method: "POST";
                cloneRequest: true;
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_secret: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_assertion_type: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    token: import("better-auth").ZodString;
                    token_type_hint: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        requestBody: {
                            required: boolean;
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object";
                                        properties: {
                                            client_id: {
                                                type: string;
                                                description: string;
                                            };
                                            client_secret: {
                                                type: string;
                                                description: string;
                                            };
                                            token: {
                                                type: string;
                                                description: string;
                                            };
                                            token_type_hint: {
                                                type: string;
                                                description: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                        };
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            description: string;
                                        };
                                    };
                                };
                            };
                            "400": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                                error_uri: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, null | undefined>;
            oauth2UserInfo: import("better-auth").StrictEndpoint<"/oauth2/userinfo", {
                method: ("GET" | "POST")[];
                body: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    access_token: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$loose>>;
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    openapi: {
                        description: string;
                        security: ({
                            bearerAuth: never[];
                            OAuth2?: undefined;
                        } | {
                            OAuth2: string[];
                            bearerAuth?: undefined;
                        })[];
                        parameters: {
                            name: string;
                            in: "header";
                            required: false;
                            schema: {
                                type: "string";
                            };
                            description: string;
                        }[];
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                sub: {
                                                    type: string;
                                                    description: string;
                                                };
                                                email: {
                                                    type: string;
                                                    format: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                name: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                picture: {
                                                    type: string;
                                                    format: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                given_name: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                family_name: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                email_verified: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            "401": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            "403": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                error: {
                                                    type: string;
                                                };
                                                error_description: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                sub: unknown;
            }>;
            oauth2EndSession: import("better-auth").StrictEndpoint<"/oauth2/end-session", {
                method: ("GET" | "POST")[];
                body: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    id_token_hint: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    state: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>>;
                query: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    id_token_hint: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    state: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>>;
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    $Infer: {
                        body: {
                            id_token_hint?: string;
                            client_id?: string;
                            post_logout_redirect_uri?: string;
                            state?: string;
                        } | {
                            query: {
                                id_token_hint?: string;
                                client_id?: string;
                                post_logout_redirect_uri?: string;
                                state?: string;
                            };
                        };
                        query: {
                            id_token_hint?: string;
                            client_id?: string;
                            post_logout_redirect_uri?: string;
                            state?: string;
                        };
                    };
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                redirect_uri: {
                                                    type: string;
                                                    format: string;
                                                    description: string;
                                                };
                                                message: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                        };
                                    };
                                    "text/html": {
                                        schema: {
                                            type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, Response | {
                redirect: true;
                url: string;
            } | null>;
            oauth2EndSessionConfirmation: import("better-auth").StrictEndpoint<"/oauth2/end-session/confirm", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    action: import("better-auth").ZodLiteral<"confirm">;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    allowedMediaTypes: string[];
                    scope: "http";
                };
            }, Response | {
                redirect: true;
                url: string;
            } | null>;
            registerOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/register", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    token_endpoint_auth_method: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    jwks: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                        keys: import("better-auth").ZodArray<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                    }, import("zod/v4/core").$strip>>;
                    jwks_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                        code: "code";
                    }>>>;
                    application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        web: "web";
                        native: "native";
                    }>>;
                    subject_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        public: "public";
                        pairwise: "pairwise";
                    }>>;
                    dpop_bound_access_tokens: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    resources: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    skip_consent: import("better-auth").ZodOptional<import("better-auth").ZodNever>;
                }, import("zod/v4/core").$strip>;
                errorCodesByField: {
                    redirect_uris: "invalid_redirect_uri";
                    post_logout_redirect_uris: "invalid_redirect_uri";
                    software_statement: "invalid_software_statement";
                    resources: "invalid_target";
                };
                defaultError: "invalid_client_metadata";
                metadata: {
                    noStore: boolean;
                    openapi: {
                        description: string;
                        responses: {
                            "201": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                client_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret_expires_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                user_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_id_issued_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_name: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                logo_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                contacts: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                tos_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                policy_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_version: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_statement: {
                                                    type: string;
                                                    description: string;
                                                };
                                                redirect_uris: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                post_logout_redirect_uris: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                backchannel_logout_uri: {
                                                    type: string;
                                                    format: string;
                                                    description: string;
                                                };
                                                backchannel_logout_session_required: {
                                                    type: string;
                                                    description: string;
                                                };
                                                token_endpoint_auth_method: {
                                                    type: string;
                                                    description: string;
                                                };
                                                grant_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                response_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        enum: string[];
                                                    };
                                                    description: string;
                                                };
                                                application_type: {
                                                    type: string;
                                                    description: string;
                                                    enum: string[];
                                                };
                                                resources: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                disabled: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientRegistrationResponse>;
            adminCreateOAuthClient: import("better-auth").StrictEndpoint<"/admin/oauth2/create-client", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    token_endpoint_auth_method: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        web: "web";
                        native: "native";
                    }>>;
                    jwks: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                        keys: import("better-auth").ZodArray<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                    }, import("zod/v4/core").$strip>>;
                    jwks_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    client_credentials_scopes: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                        code: "code";
                    }>>>;
                    client_secret_expires_at: import("better-auth").ZodDefault<import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodNumber]>>>;
                    skip_consent: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    enable_end_session: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    require_pkce: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    dpop_bound_access_tokens: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    subject_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        public: "public";
                        pairwise: "pairwise";
                    }>>;
                    metadata: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    SERVER_ONLY: true;
                    openapi: {
                        description: string;
                        responses: {
                            "201": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                client_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret_expires_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_credentials_scopes: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                user_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_id_issued_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_name: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                logo_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                contacts: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                tos_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                policy_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_version: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_statement: {
                                                    type: string;
                                                    description: string;
                                                };
                                                redirect_uris: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                token_endpoint_auth_method: {
                                                    type: string;
                                                    description: string;
                                                };
                                                grant_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                response_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        enum: string[];
                                                    };
                                                    description: string;
                                                };
                                                application_type: {
                                                    type: string;
                                                    description: string;
                                                    enum: string[];
                                                };
                                                resources: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                disabled: {
                                                    type: string;
                                                    description: string;
                                                };
                                                require_pkce: {
                                                    type: string;
                                                    description: string;
                                                    default: boolean;
                                                };
                                                metadata: {
                                                    type: string;
                                                    additionalProperties: boolean;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientAdministrativeResponse>;
            createOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/create-client", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                    backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                    backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    token_endpoint_auth_method: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        web: "web";
                        native: "native";
                    }>>;
                    jwks: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                        keys: import("better-auth").ZodArray<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                    }, import("zod/v4/core").$strip>>;
                    jwks_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                    response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                        code: "code";
                    }>>>;
                    dpop_bound_access_tokens: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    openapi: {
                        description: string;
                        responses: {
                            "201": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                client_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_secret_expires_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                scope: {
                                                    type: string;
                                                    description: string;
                                                };
                                                user_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_id_issued_at: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_name: {
                                                    type: string;
                                                    description: string;
                                                };
                                                client_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                logo_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                contacts: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                tos_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                policy_uri: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_id: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_version: {
                                                    type: string;
                                                    description: string;
                                                };
                                                software_statement: {
                                                    type: string;
                                                    description: string;
                                                };
                                                redirect_uris: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                token_endpoint_auth_method: {
                                                    type: string;
                                                    description: string;
                                                };
                                                grant_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                    };
                                                    description: string;
                                                };
                                                response_types: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        enum: string[];
                                                    };
                                                    description: string;
                                                };
                                                application_type: {
                                                    type: string;
                                                    description: string;
                                                    enum: string[];
                                                };
                                                resources: {
                                                    type: string;
                                                    items: {
                                                        type: string;
                                                        format: string;
                                                    };
                                                    description: string;
                                                };
                                                disabled: {
                                                    type: string;
                                                    description: string;
                                                };
                                                metadata: {
                                                    type: string;
                                                    additionalProperties: boolean;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientRegistrationResponse>;
            getOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/get-client", {
                method: "GET";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                query: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient>;
            getOAuthClientPublic: import("better-auth").StrictEndpoint<"/oauth2/public-client", {
                method: "GET";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                query: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient>;
            getOAuthClientPublicPrelogin: import("better-auth").StrictEndpoint<"/oauth2/public-client-prelogin", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>[];
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                    oauth_query: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient>;
            getOAuthClients: import("better-auth").StrictEndpoint<"/oauth2/get-clients", {
                method: "GET";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient[] | null>;
            adminUpdateOAuthClient: import("better-auth").StrictEndpoint<"/admin/oauth2/update-client", {
                method: "PATCH";
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                    update: import("better-auth").ZodObject<{
                        redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                        scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                        backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                        backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                            web: "web";
                            native: "native";
                        }>>;
                        grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        client_credentials_scopes: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                            code: "code";
                        }>>>;
                        client_secret_expires_at: import("better-auth").ZodOptional<import("better-auth").ZodUnion<readonly [import("better-auth").ZodString, import("better-auth").ZodNumber]>>;
                        skip_consent: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        enable_end_session: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        dpop_bound_access_tokens: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        metadata: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>;
                    }, import("zod/v4/core").$strip>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    SERVER_ONLY: true;
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientAdministrativeResponse>;
            updateOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/update-client", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                    update: import("better-auth").ZodObject<{
                        redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                        scope: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        client_name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        client_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        logo_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        contacts: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        tos_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        policy_uri: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_id: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_version: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        software_statement: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                        post_logout_redirect_uris: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodURL>>;
                        backchannel_logout_uri: import("better-auth").ZodOptional<import("better-auth").ZodURL>;
                        backchannel_logout_session_required: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                        application_type: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                            web: "web";
                            native: "native";
                        }>>;
                        grant_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodString>>;
                        response_types: import("better-auth").ZodOptional<import("better-auth").ZodArray<import("better-auth").ZodEnum<{
                            code: "code";
                        }>>>;
                    }, import("zod/v4/core").$strip>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClientRegistrationResponse>;
            rotateClientSecret: import("better-auth").StrictEndpoint<"/oauth2/client/rotate-secret", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    noStore: boolean;
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthClient>;
            deleteOAuthClient: import("better-auth").StrictEndpoint<"/oauth2/delete-client", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    client_id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, void>;
            getOAuthConsent: import("better-auth").StrictEndpoint<"/oauth2/get-consent", {
                method: "GET";
                query: import("better-auth").ZodObject<{
                    id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthConsent<import("@better-auth/oauth-provider/*").Scope[]>>;
            getOAuthConsents: import("better-auth").StrictEndpoint<"/oauth2/get-consents", {
                method: "GET";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthConsent<import("@better-auth/oauth-provider/*").Scope[]>[]>;
            updateOAuthConsent: import("better-auth").StrictEndpoint<"/oauth2/update-consent", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    id: import("better-auth").ZodString;
                    update: import("better-auth").ZodObject<{
                        scopes: import("better-auth").ZodArray<import("better-auth").ZodString>;
                    }, import("zod/v4/core").$strip>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, import("@better-auth/oauth-provider/*").OAuthConsent<import("@better-auth/oauth-provider/*").Scope[]> | null>;
            deleteOAuthConsent: import("better-auth").StrictEndpoint<"/oauth2/delete-consent", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                body: import("better-auth").ZodObject<{
                    id: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                    };
                };
            }, void>;
            adminCreateOAuthResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    identifier: import("better-auth").ZodNonOptional<import("better-auth").ZodOptional<import("better-auth").ZodString>>;
                    name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    accessTokenTtl: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodNumber>>;
                    refreshTokenTtl: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodNumber>>;
                    signingAlgorithm: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodEnum<{
                        RS256: "RS256";
                        PS256: "PS256";
                        ES256: "ES256";
                        ES512: "ES512";
                        EdDSA: "EdDSA";
                    }>>>;
                    signingKeyId: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodString>>;
                    allowedScopes: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodArray<import("better-auth").ZodString>>>;
                    customClaims: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>>;
                    dpopBoundAccessTokensRequired: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    disabled: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    metadata: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").OAuthResource>;
            adminListOAuthResources: import("better-auth").StrictEndpoint<"/admin/oauth2/resources", {
                method: "GET";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").OAuthResource[]>;
            adminGetOAuthResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier", {
                method: "GET";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").OAuthResource>;
            adminUpdateOAuthResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier", {
                method: "PATCH";
                body: import("better-auth").ZodObject<{
                    identifier: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    accessTokenTtl: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodNumber>>;
                    refreshTokenTtl: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodNumber>>;
                    signingAlgorithm: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodEnum<{
                        RS256: "RS256";
                        PS256: "PS256";
                        ES256: "ES256";
                        ES512: "ES512";
                        EdDSA: "EdDSA";
                    }>>>;
                    signingKeyId: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodString>>;
                    allowedScopes: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodArray<import("better-auth").ZodString>>>;
                    customClaims: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>>;
                    dpopBoundAccessTokensRequired: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    disabled: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    metadata: import("better-auth").ZodOptional<import("better-auth").ZodNullable<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodUnknown>>>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    SERVER_ONLY: true;
                };
            }, import("@better-auth/oauth-provider/*").OAuthResource>;
            adminDeleteOAuthResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier", {
                method: "DELETE";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, {
                deleted: boolean;
            }>;
            adminLinkClientResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier/clients/:client_id", {
                method: "POST";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, {
                linked: boolean;
            }>;
            adminUnlinkClientResource: import("better-auth").StrictEndpoint<"/admin/oauth2/resources/:identifier/clients/:client_id", {
                method: "DELETE";
                metadata: {
                    SERVER_ONLY: true;
                };
            }, {
                unlinked: boolean;
            }>;
        };
        schema: {
            oauthClient: {
                modelName: string;
                fields: {
                    clientId: {
                        type: "string";
                        unique: true;
                        required: true;
                    };
                    clientSecret: {
                        type: "string";
                        required: false;
                    };
                    clientDiscoveryId: {
                        type: "string";
                        required: false;
                    };
                    disabled: {
                        type: "boolean";
                        defaultValue: false;
                        required: false;
                    };
                    skipConsent: {
                        type: "boolean";
                        required: false;
                    };
                    enableEndSession: {
                        type: "boolean";
                        required: false;
                    };
                    subjectType: {
                        type: "string";
                        required: false;
                    };
                    scopes: {
                        type: "string[]";
                        required: false;
                    };
                    clientCredentialsScopes: {
                        type: "string[]";
                        required: false;
                        defaultValue: never[];
                    };
                    userId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    createdAt: {
                        type: "date";
                        required: false;
                    };
                    updatedAt: {
                        type: "date";
                        required: false;
                    };
                    name: {
                        type: "string";
                        required: false;
                    };
                    uri: {
                        type: "string";
                        required: false;
                    };
                    icon: {
                        type: "string";
                        required: false;
                    };
                    contacts: {
                        type: "string[]";
                        required: false;
                    };
                    tos: {
                        type: "string";
                        required: false;
                    };
                    policy: {
                        type: "string";
                        required: false;
                    };
                    softwareId: {
                        type: "string";
                        required: false;
                    };
                    softwareVersion: {
                        type: "string";
                        required: false;
                    };
                    softwareStatement: {
                        type: "string";
                        required: false;
                    };
                    redirectUris: {
                        type: "string[]";
                        required: true;
                    };
                    postLogoutRedirectUris: {
                        type: "string[]";
                        required: false;
                    };
                    backchannelLogoutUri: {
                        type: "string";
                        required: false;
                    };
                    backchannelLogoutSessionRequired: {
                        type: "boolean";
                        required: false;
                    };
                    tokenEndpointAuthMethod: {
                        type: "string";
                        required: false;
                    };
                    applicationType: {
                        type: "string";
                        required: false;
                    };
                    jwks: {
                        type: "string";
                        required: false;
                    };
                    jwksUri: {
                        type: "string";
                        required: false;
                    };
                    grantTypes: {
                        type: "string[]";
                        required: false;
                    };
                    responseTypes: {
                        type: "string[]";
                        required: false;
                    };
                    requirePKCE: {
                        type: "boolean";
                        required: false;
                    };
                    dpopBoundAccessTokens: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                    };
                    referenceId: {
                        type: "string";
                        required: false;
                    };
                    metadata: {
                        type: "json";
                        required: false;
                    };
                };
            };
            oauthResource: {
                modelName: string;
                fields: {
                    identifier: {
                        type: "string";
                        required: true;
                        unique: true;
                    };
                    name: {
                        type: "string";
                        required: true;
                    };
                    accessTokenTtl: {
                        type: "number";
                        required: false;
                    };
                    refreshTokenTtl: {
                        type: "number";
                        required: false;
                    };
                    signingAlgorithm: {
                        type: "string";
                        required: false;
                    };
                    signingKeyId: {
                        type: "string";
                        required: false;
                    };
                    allowedScopes: {
                        type: "string[]";
                        required: false;
                    };
                    customClaims: {
                        type: "json";
                        required: false;
                    };
                    dpopBoundAccessTokensRequired: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                    };
                    disabled: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                    };
                    createdAt: {
                        type: "date";
                        required: false;
                    };
                    updatedAt: {
                        type: "date";
                        required: false;
                    };
                    policyVersion: {
                        type: "number";
                        required: false;
                        defaultValue: number;
                    };
                    metadata: {
                        type: "json";
                        required: false;
                    };
                };
            };
            oauthClientResource: {
                modelName: string;
                fields: {
                    clientId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                            onDelete: "cascade";
                        };
                        index: true;
                    };
                    resourceId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                            onDelete: "cascade";
                        };
                        index: true;
                    };
                    metadata: {
                        type: "json";
                        required: false;
                    };
                    createdAt: {
                        type: "date";
                        required: false;
                    };
                };
                indexes: {
                    fields: [string, string];
                    unique: true;
                }[];
            };
            oauthRefreshToken: {
                fields: {
                    token: {
                        type: "string";
                        required: true;
                        unique: true;
                    };
                    clientId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    sessionId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                            onDelete: "set null";
                        };
                        index: true;
                    };
                    userId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    referenceId: {
                        type: "string";
                        required: false;
                    };
                    authorizationCodeId: {
                        type: "string";
                        required: false;
                        index: true;
                    };
                    resources: {
                        type: "string[]";
                        required: false;
                    };
                    requestedUserInfoClaims: {
                        type: "string[]";
                        required: false;
                    };
                    expiresAt: {
                        type: "date";
                    };
                    createdAt: {
                        type: "date";
                    };
                    revoked: {
                        type: "date";
                        required: false;
                    };
                    rotatedAt: {
                        type: "date";
                        required: false;
                    };
                    rotationReplayResponse: {
                        type: "string";
                        required: false;
                    };
                    rotationReplayExpiresAt: {
                        type: "date";
                        required: false;
                    };
                    authTime: {
                        type: "date";
                        required: false;
                    };
                    confirmation: {
                        type: "json";
                        required: false;
                    };
                    scopes: {
                        type: "string[]";
                        required: true;
                    };
                };
            };
            oauthAccessToken: {
                modelName: string;
                fields: {
                    token: {
                        type: "string";
                        unique: true;
                    };
                    clientId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    sessionId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                            onDelete: "set null";
                        };
                        index: true;
                    };
                    userId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    referenceId: {
                        type: "string";
                        required: false;
                    };
                    authorizationCodeId: {
                        type: "string";
                        required: false;
                        index: true;
                    };
                    resources: {
                        type: "string[]";
                        required: false;
                    };
                    requestedUserInfoClaims: {
                        type: "string[]";
                        required: false;
                    };
                    refreshId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    expiresAt: {
                        type: "date";
                    };
                    createdAt: {
                        type: "date";
                    };
                    revoked: {
                        type: "date";
                        required: false;
                    };
                    confirmation: {
                        type: "json";
                        required: false;
                    };
                    scopes: {
                        type: "string[]";
                        required: true;
                    };
                };
            };
            oauthConsent: {
                modelName: string;
                fields: {
                    clientId: {
                        type: "string";
                        required: true;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    userId: {
                        type: "string";
                        required: false;
                        references: {
                            model: string;
                            field: string;
                        };
                        index: true;
                    };
                    referenceId: {
                        type: "string";
                        required: false;
                    };
                    resources: {
                        type: "string[]";
                        required: false;
                    };
                    requestedUserInfoClaims: {
                        type: "string[]";
                        required: false;
                    };
                    scopes: {
                        type: "string[]";
                        required: true;
                    };
                    createdAt: {
                        type: "date";
                    };
                    updatedAt: {
                        type: "date";
                    };
                };
            };
            oauthClientAssertion: {
                modelName: string;
                fields: {
                    expiresAt: {
                        type: "date";
                        required: true;
                    };
                };
            };
        };
        rateLimit: ({
            pathMatcher: (path: string) => path is "/oauth2/token";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/authorize";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/introspect";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/revoke";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/register";
            window: number;
            max: number;
        } | {
            pathMatcher: (path: string) => path is "/oauth2/userinfo";
            window: number;
            max: number;
        })[];
    } | {
        id: "cimd";
        version: string;
        init(ctx: import("better-auth").AuthContext): void;
    } | {
        id: "stripe";
        version: string;
        endpoints: {
            stripeWebhook: import("better-auth").StrictEndpoint<"/stripe/webhook", {
                method: "POST";
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                    scope: "server";
                };
                cloneRequest: true;
                disableBody: true;
            }, {
                success: boolean;
            }>;
        } & {
            upgradeSubscription: import("better-auth").StrictEndpoint<"/subscription/upgrade", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    plan: import("better-auth").ZodString;
                    annual: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    subscriptionId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                    metadata: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                    seats: import("better-auth").ZodOptional<import("better-auth").ZodNumber>;
                    locale: import("better-auth").ZodOptional<import("better-auth").ZodCustom<import("@better-auth/stripe").CheckoutSessionLocale, import("@better-auth/stripe").CheckoutSessionLocale>>;
                    successUrl: import("better-auth").ZodDefault<import("better-auth").ZodString>;
                    cancelUrl: import("better-auth").ZodDefault<import("better-auth").ZodString>;
                    returnUrl: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    scheduleAtPeriodEnd: import("better-auth").ZodDefault<import("better-auth").ZodBoolean>;
                    disableRedirect: import("better-auth").ZodDefault<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>)[];
            }, {
                url: string;
                redirect: boolean;
            } | (import("stripe").Stripe.Checkout.Session & {
                lastResponse: {
                    headers: {
                        [key: string]: string;
                    };
                    requestId: string;
                    statusCode: number;
                    apiVersion?: string;
                    idempotencyKey?: string;
                    stripeAccount?: string;
                };
            } & {
                redirect: boolean;
            })>;
            cancelSubscription: import("better-auth").StrictEndpoint<"/subscription/cancel", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    subscriptionId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                    returnUrl: import("better-auth").ZodString;
                    disableRedirect: import("better-auth").ZodDefault<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>)[];
            }, {
                url: string;
                redirect: boolean;
            }>;
            restoreSubscription: import("better-auth").StrictEndpoint<"/subscription/restore", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    subscriptionId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>>)[];
            }, import("stripe").Stripe.Response<import("stripe").Stripe.Subscription>>;
            listActiveSubscriptions: import("better-auth").StrictEndpoint<"/subscription/list", {
                method: "GET";
                query: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                }, import("zod/v4/core").$strip>>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>>)[];
            }, {
                limits: Record<string, unknown> | undefined;
                priceId: string | undefined;
                id: string;
                plan: string;
                stripeCustomerId?: string | undefined;
                stripeSubscriptionId?: string | undefined;
                trialStart?: Date | undefined;
                trialEnd?: Date | undefined;
                referenceId: string;
                status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                periodStart?: Date | undefined;
                periodEnd?: Date | undefined;
                cancelAtPeriodEnd?: boolean | undefined;
                cancelAt?: Date | undefined;
                canceledAt?: Date | undefined;
                endedAt?: Date | undefined;
                groupId?: string | undefined;
                seats?: number | undefined;
                billingInterval?: "day" | "week" | "month" | "year" | undefined;
                stripeScheduleId?: string | undefined;
            }[]>;
            subscriptionSuccess: import("better-auth").StrictEndpoint<"/subscription/success", {
                method: "GET";
                query: import("better-auth").ZodOptional<import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>[];
            }, never>;
            createBillingPortal: import("better-auth").StrictEndpoint<"/subscription/billing-portal", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    locale: import("better-auth").ZodOptional<import("better-auth").ZodCustom<import("@better-auth/stripe").CheckoutSessionLocale, import("@better-auth/stripe").CheckoutSessionLocale>>;
                    referenceId: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    customerType: import("better-auth").ZodOptional<import("better-auth").ZodEnum<{
                        user: "user";
                        organization: "organization";
                    }>>;
                    returnUrl: import("better-auth").ZodDefault<import("better-auth").ZodString>;
                    disableRedirect: import("better-auth").ZodDefault<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                    };
                };
                use: (import("better-auth").Middleware<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }, (inputContext: import("better-auth").MiddlewareInputContext<{
                    use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                        session: {
                            session: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                userId: string;
                                expiresAt: Date;
                                token: string;
                                ipAddress?: string | null | undefined;
                                userAgent?: string | null | undefined;
                            };
                            user: Record<string, any> & {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            };
                        };
                    }>>[];
                }>) => Promise<{
                    session: import("@better-auth/stripe").StripeCtxSession;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    referenceId: string;
                }>> | import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>)[];
            }, {
                url: string;
                redirect: boolean;
            }>;
        };
        init(ctx: import("better-auth").AuthContext): {
            options: {
                databaseHooks: {
                    user: {
                        create: {
                            after(user: import("better-auth").User & import("@better-auth/stripe").WithStripeCustomerId, ctx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                        };
                        update: {
                            after(user: import("better-auth").User & import("@better-auth/stripe").WithStripeCustomerId, ctx: import("better-auth").GenericEndpointContext | null): Promise<void>;
                        };
                    };
                };
            };
        } | undefined;
        schema: {
            user: {
                fields: {
                    stripeCustomerId: {
                        type: "string";
                        required: false;
                    };
                };
            };
        } & {
            subscription: {
                fields: {
                    plan: {
                        type: "string";
                        required: true;
                    };
                    referenceId: {
                        type: "string";
                        required: true;
                    };
                    stripeCustomerId: {
                        type: "string";
                        required: false;
                    };
                    stripeSubscriptionId: {
                        type: "string";
                        required: false;
                    };
                    status: {
                        type: "string";
                        defaultValue: string;
                    };
                    periodStart: {
                        type: "date";
                        required: false;
                    };
                    periodEnd: {
                        type: "date";
                        required: false;
                    };
                    trialStart: {
                        type: "date";
                        required: false;
                    };
                    trialEnd: {
                        type: "date";
                        required: false;
                    };
                    cancelAtPeriodEnd: {
                        type: "boolean";
                        required: false;
                        defaultValue: false;
                    };
                    cancelAt: {
                        type: "date";
                        required: false;
                    };
                    canceledAt: {
                        type: "date";
                        required: false;
                    };
                    endedAt: {
                        type: "date";
                        required: false;
                    };
                    seats: {
                        type: "number";
                        required: false;
                    };
                    billingInterval: {
                        type: "string";
                        required: false;
                    };
                    stripeScheduleId: {
                        type: "string";
                        required: false;
                    };
                };
            };
        };
        options: NoInfer<{
            stripeClient: import("stripe").Stripe;
            stripeWebhookSecret: string;
            subscription: {
                enabled: true;
                plans: {
                    name: string;
                    priceId: string;
                }[];
                onSubscriptionComplete: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                    plan: import("@better-auth/stripe").StripePlan;
                }) => Promise<void>;
                onSubscriptionCreated: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                    plan: import("@better-auth/stripe").StripePlan;
                }) => Promise<void>;
                onSubscriptionUpdate: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                }) => Promise<void>;
                onSubscriptionCancel: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                    cancellationDetails?: import("stripe").Stripe.Subscription.CancellationDetails | null;
                }) => Promise<void>;
                onSubscriptionDeleted: ({ event, subscription }: {
                    event: import("stripe").Stripe.Event;
                    stripeSubscription: import("stripe").Stripe.Subscription;
                    subscription: import("@better-auth/stripe").Subscription;
                }) => Promise<void>;
            };
        }>;
        $ERROR_CODES: {
            UNAUTHORIZED: import("better-auth").RawError<"UNAUTHORIZED">;
            INVALID_REQUEST_BODY: import("better-auth").RawError<"INVALID_REQUEST_BODY">;
            SUBSCRIPTION_NOT_FOUND: import("better-auth").RawError<"SUBSCRIPTION_NOT_FOUND">;
            SUBSCRIPTION_PLAN_NOT_FOUND: import("better-auth").RawError<"SUBSCRIPTION_PLAN_NOT_FOUND">;
            ALREADY_SUBSCRIBED_PLAN: import("better-auth").RawError<"ALREADY_SUBSCRIBED_PLAN">;
            REFERENCE_ID_NOT_ALLOWED: import("better-auth").RawError<"REFERENCE_ID_NOT_ALLOWED">;
            CUSTOMER_NOT_FOUND: import("better-auth").RawError<"CUSTOMER_NOT_FOUND">;
            UNABLE_TO_CREATE_CUSTOMER: import("better-auth").RawError<"UNABLE_TO_CREATE_CUSTOMER">;
            UNABLE_TO_CREATE_BILLING_PORTAL: import("better-auth").RawError<"UNABLE_TO_CREATE_BILLING_PORTAL">;
            STRIPE_SIGNATURE_NOT_FOUND: import("better-auth").RawError<"STRIPE_SIGNATURE_NOT_FOUND">;
            STRIPE_WEBHOOK_SECRET_NOT_FOUND: import("better-auth").RawError<"STRIPE_WEBHOOK_SECRET_NOT_FOUND">;
            STRIPE_WEBHOOK_ERROR: import("better-auth").RawError<"STRIPE_WEBHOOK_ERROR">;
            FAILED_TO_CONSTRUCT_STRIPE_EVENT: import("better-auth").RawError<"FAILED_TO_CONSTRUCT_STRIPE_EVENT">;
            FAILED_TO_FETCH_PLANS: import("better-auth").RawError<"FAILED_TO_FETCH_PLANS">;
            EMAIL_VERIFICATION_REQUIRED: import("better-auth").RawError<"EMAIL_VERIFICATION_REQUIRED">;
            SUBSCRIPTION_NOT_ACTIVE: import("better-auth").RawError<"SUBSCRIPTION_NOT_ACTIVE">;
            SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION: import("better-auth").RawError<"SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION">;
            SUBSCRIPTION_NOT_PENDING_CHANGE: import("better-auth").RawError<"SUBSCRIPTION_NOT_PENDING_CHANGE">;
            ORGANIZATION_NOT_FOUND: import("better-auth").RawError<"ORGANIZATION_NOT_FOUND">;
            ORGANIZATION_SUBSCRIPTION_NOT_ENABLED: import("better-auth").RawError<"ORGANIZATION_SUBSCRIPTION_NOT_ENABLED">;
            AUTHORIZE_REFERENCE_REQUIRED: import("better-auth").RawError<"AUTHORIZE_REFERENCE_REQUIRED">;
            ORGANIZATION_HAS_ACTIVE_SUBSCRIPTION: import("better-auth").RawError<"ORGANIZATION_HAS_ACTIVE_SUBSCRIPTION">;
            ORGANIZATION_REFERENCE_ID_REQUIRED: import("better-auth").RawError<"ORGANIZATION_REFERENCE_ID_REQUIRED">;
        };
    })[];
    session: {
        cookieCache: {
            enabled: true;
            maxAge: number;
        };
    };
    account: {
        accountLinking: {
            enabled: true;
            trustedProviders: ("github" | "discord" | "google")[];
        };
    };
    emailAndPassword: {
        enabled: true;
        minPasswordLength: number;
        requireEmailVerification: boolean;
        sendResetPassword: ({ user, url }: {
            user: import("better-auth").User;
            url: string;
            token: string;
        }) => Promise<void>;
    };
    emailVerification: {
        sendOnSignUp: boolean;
        autoSignInAfterVerification: true;
        sendVerificationEmail: ({ user, url }: {
            user: import("better-auth").User;
            url: string;
            token: string;
        }) => Promise<void>;
    };
    socialProviders: {
        google: {
            clientId: string;
            clientSecret: string;
            enabled: boolean;
        };
        github: {
            clientId: string;
            clientSecret: string;
            enabled: boolean;
            scope: string[];
        };
        discord: {
            clientId: string;
            clientSecret: string;
            enabled: boolean;
            scope: string[];
        };
    };
    trustedOrigins: string[];
}>;
export declare const auth: Auth;
export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
