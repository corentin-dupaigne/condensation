package fr.fullstack.backend.unit.exception;

import fr.fullstack.backend.dto.ApiError;
import fr.fullstack.backend.exception.GlobalExceptionHandler;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleEntityNotFound_returns404WithMessage() {
        EntityNotFoundException ex = new EntityNotFoundException("Le jeu avec l'ID 42 est introuvable.");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/games/42");

        ResponseEntity<ApiError> response = handler.handleEntityNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(404);
        assertThat(response.getBody().error()).isEqualTo("Not Found");
        assertThat(response.getBody().message()).isEqualTo("Le jeu avec l'ID 42 est introuvable.");
        assertThat(response.getBody().path()).isEqualTo("/api/games/42");
    }

    @Test
    void handleEntityNotFound_includesTimestamp() {
        EntityNotFoundException ex = new EntityNotFoundException("Not found");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/games/1");

        ResponseEntity<ApiError> response = handler.handleEntityNotFound(ex, request);

        assertThat(response.getBody().timestamp()).isNotNull();
    }

    @Test
    void handleGenericException_returns500WithGenericMessage() {
        Exception ex = new RuntimeException("Something broke");
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/games");

        ResponseEntity<ApiError> response = handler.handleGenericException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(500);
        assertThat(response.getBody().error()).isEqualTo("Internal Server Error");
        assertThat(response.getBody().message()).isEqualTo("Une erreur inattendue est survenue sur le serveur.");
        assertThat(response.getBody().path()).isEqualTo("/api/games");
    }

    @Test
    void handleGenericException_doesNotLeakExceptionMessage() {
        Exception ex = new RuntimeException("SQL injection or sensitive info");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");

        ResponseEntity<ApiError> response = handler.handleGenericException(ex, request);

        assertThat(response.getBody().message()).doesNotContain("SQL injection");
        assertThat(response.getBody().message()).isEqualTo("Une erreur inattendue est survenue sur le serveur.");
    }
}
