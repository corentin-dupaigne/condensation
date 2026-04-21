package fr.fullstack.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.security.oauth2.server.resource.introspection.OAuth2IntrospectionException;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Collections;
import java.util.Map;

@Component
public class AuthServiceIntrospector implements OpaqueTokenIntrospector {

    private final String authUserUrl;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthServiceIntrospector(@Value("${AUTH_URL:http://auth}") String authUrl) {
        this.authUserUrl = authUrl + "/api/user";
    }

    @Override
    public OAuth2AuthenticatedPrincipal introspect(String token) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(authUserUrl))
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new OAuth2IntrospectionException("Token rejected by auth service");
            }

            JsonNode body = objectMapper.readTree(response.body());
            int userId = body.get("id").asInt();

            return new SimpleOAuth2Principal(userId);
        } catch (OAuth2IntrospectionException e) {
            throw e;
        } catch (Exception e) {
            throw new OAuth2IntrospectionException("Failed to introspect token: " + e.getMessage());
        }
    }

    public record SimpleOAuth2Principal(int userId) implements OAuth2AuthenticatedPrincipal {
        @Override public String getName() { return String.valueOf(userId); }
        @Override public Map<String, Object> getAttributes() { return Collections.emptyMap(); }
        @Override public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() { return Collections.emptyList(); }
    }
}
