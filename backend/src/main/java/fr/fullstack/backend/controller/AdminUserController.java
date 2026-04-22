package fr.fullstack.backend.controller;

import fr.fullstack.backend.service.AuthProxyService;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AuthProxyService authProxyService;

    public AdminUserController(AuthProxyService authProxyService) {
        this.authProxyService = authProxyService;
    }

    @GetMapping
    public ResponseEntity<String> listUsers(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        ResponseEntity<String> resp = authProxyService.proxy("/api/admin/users", HttpMethod.GET, auth, null);
        return toJson(resp);
    }

    @PostMapping
    public ResponseEntity<String> createUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody String body) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        ResponseEntity<String> resp = authProxyService.proxy("/api/admin/users", HttpMethod.POST, auth, body);
        return toJson(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> getUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable String id) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        ResponseEntity<String> resp = authProxyService.proxy("/api/admin/users/" + id, HttpMethod.GET, auth, null);
        return toJson(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable String id,
            @RequestBody String body) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        ResponseEntity<String> resp = authProxyService.proxy("/api/admin/users/" + id, HttpMethod.PUT, auth, body);
        return toJson(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable String id) {
        if (authProxyService.requireAdminToken(auth) == null) return forbidden();
        ResponseEntity<String> resp = authProxyService.proxy("/api/admin/users/" + id, HttpMethod.DELETE, auth, null);
        if (resp.getStatusCode().value() == 204) {
            return ResponseEntity.noContent().build();
        }
        return toJson(resp);
    }

    private ResponseEntity<String> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\":\"Forbidden\"}");
    }

    private ResponseEntity<String> toJson(ResponseEntity<String> resp) {
        return ResponseEntity.status(resp.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(resp.getBody());
    }
}
