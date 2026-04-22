package fr.fullstack.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AuthProxyService {

    private final RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    public AuthProxyService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Calls the auth service GET /api/user with the provided Bearer token.
     * Returns the raw JSON response body, or null if the token is invalid.
     */
    public String getUserJson(String bearerToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", bearerToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    authServiceUrl + "/api/user",
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Validates that the Bearer token belongs to an admin user.
     * Returns the token if valid and admin, null otherwise.
     */
    @SuppressWarnings("unchecked")
    public String requireAdminToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) return null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", bearerToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    authServiceUrl + "/api/user",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            if (!response.getStatusCode().is2xxSuccessful()) return null;
            Map<String, Object> user = response.getBody();
            if (user == null) return null;
            return "admin".equals(user.get("role")) ? bearerToken : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Proxies a request to the auth service and returns the raw response.
     */
    public ResponseEntity<String> proxy(String path, HttpMethod method, String bearerToken, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", bearerToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = (body != null) ? new HttpEntity<>(body, headers) : new HttpEntity<>(headers);
            return restTemplate.exchange(authServiceUrl + path, method, entity, String.class);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"Auth service unreachable\"}");
        }
    }
}
