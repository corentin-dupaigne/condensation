package fr.fullstack.backend.dto;

import java.time.ZonedDateTime;

public record ApiError(
        int status,
        String error,
        String message,
        String path,
        ZonedDateTime timestamp
) {
    public ApiError(int status, String error, String message, String path) {
        this(status, error, message, path, ZonedDateTime.now());
    }
}