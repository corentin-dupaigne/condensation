package fr.fullstack.backend.unit.dto;

import fr.fullstack.backend.dto.ApiError;
import org.junit.jupiter.api.Test;

import java.time.ZonedDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ApiErrorTest {

    @Test
    void fourArgConstructor_setsAllFieldsAndAutoTimestamp() {
        ZonedDateTime before = ZonedDateTime.now();

        ApiError error = new ApiError(404, "Not Found", "missing", "/api/games/1");

        assertThat(error.status()).isEqualTo(404);
        assertThat(error.error()).isEqualTo("Not Found");
        assertThat(error.message()).isEqualTo("missing");
        assertThat(error.path()).isEqualTo("/api/games/1");
        assertThat(error.timestamp()).isNotNull();
        assertThat(error.timestamp()).isAfterOrEqualTo(before);
    }

    @Test
    void fiveArgConstructor_usesProvidedTimestamp() {
        ZonedDateTime fixed = ZonedDateTime.parse("2026-01-01T12:00:00+01:00");

        ApiError error = new ApiError(500, "Internal", "err", "/x", fixed);

        assertThat(error.timestamp()).isEqualTo(fixed);
    }
}
