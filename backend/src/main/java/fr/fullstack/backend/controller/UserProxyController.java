package fr.fullstack.backend.controller;

import fr.fullstack.backend.service.AuthProxyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserProxyController {

    private final AuthProxyService authProxyService;

    public UserProxyController(AuthProxyService authProxyService) {
        this.authProxyService = authProxyService;
    }

    @GetMapping("/api/user")
    public ResponseEntity<String> getUser(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Unauthorized\"}");
        }
        ResponseEntity<String> proxied = authProxyService.proxy("/api/user", org.springframework.http.HttpMethod.GET, authorization, null);
        return ResponseEntity.status(proxied.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(proxied.getBody());
    }
}
