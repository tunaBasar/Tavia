package com.tavia.catalog_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Centralized exception handler for tavia-catalog-service.
 * Per GEMINI.md §3.4: Uses RFC 7807 ProblemDetail for all error responses,
 * with dynamic Trace IDs for observability.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ProblemDetail handleMissingRequestHeaderException(MissingRequestHeaderException ex) {
        String traceId = UUID.randomUUID().toString();
        log.error("[TraceId: {}] Missing Request Header: {}", traceId, ex.getMessage());

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setTitle("Missing Required Header");
        problemDetail.setType(URI.create("https://tavia.com/errors/missing-header"));
        problemDetail.setProperty("traceId", traceId);
        problemDetail.setProperty("timestamp", Instant.now());

        return problemDetail;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFoundException(ResourceNotFoundException ex) {
        String traceId = UUID.randomUUID().toString();
        log.error("[TraceId: {}] Resource Not Found: {}", traceId, ex.getMessage());

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setTitle("Resource Not Found");
        problemDetail.setType(URI.create("https://tavia.com/errors/not-found"));
        problemDetail.setProperty("traceId", traceId);
        problemDetail.setProperty("timestamp", Instant.now());

        return problemDetail;
    }

    @ExceptionHandler(DuplicateRecipeException.class)
    public ProblemDetail handleDuplicateRecipeException(DuplicateRecipeException ex) {
        String traceId = UUID.randomUUID().toString();
        log.error("[TraceId: {}] Duplicate Recipe: {}", traceId, ex.getMessage());

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problemDetail.setTitle("Duplicate Recipe");
        problemDetail.setType(URI.create("https://tavia.com/errors/duplicate-recipe"));
        problemDetail.setProperty("traceId", traceId);
        problemDetail.setProperty("timestamp", Instant.now());

        return problemDetail;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(MethodArgumentNotValidException ex) {
        String traceId = UUID.randomUUID().toString();
        log.error("[TraceId: {}] Validation Error: {}", traceId, ex.getMessage());

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                "Validation failed for one or more fields.");
        problemDetail.setTitle("Bad Request");
        problemDetail.setType(URI.create("https://tavia.com/errors/validation"));
        problemDetail.setProperty("traceId", traceId);
        problemDetail.setProperty("timestamp", Instant.now());

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        problemDetail.setProperty("errors", errors);

        return problemDetail;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgumentException(IllegalArgumentException ex) {
        String traceId = UUID.randomUUID().toString();
        log.error("[TraceId: {}] Illegal Argument: {}", traceId, ex.getMessage());

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setTitle("Invalid Request");
        problemDetail.setType(URI.create("https://tavia.com/errors/illegal-argument"));
        problemDetail.setProperty("traceId", traceId);
        problemDetail.setProperty("timestamp", Instant.now());

        return problemDetail;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        String traceId = UUID.randomUUID().toString();
        log.error("[TraceId: {}] Internal Server Error: {}", traceId, ex.getMessage(), ex);

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal server error occurred.");
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setType(URI.create("https://tavia.com/errors/internal-server-error"));
        problemDetail.setProperty("traceId", traceId);
        problemDetail.setProperty("timestamp", Instant.now());

        return problemDetail;
    }
}
