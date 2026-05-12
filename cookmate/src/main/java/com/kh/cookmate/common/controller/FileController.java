package com.kh.cookmate.common.controller;

import java.util.Map;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.cookmate.common.dto.FileUploadDto.ImageUploadResponse;
import com.kh.cookmate.common.service.S3UploadService;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@RestController
public class FileController {

    private final S3UploadService s3UploadService;

    public FileController(S3UploadService s3UploadService) {
        this.s3UploadService = s3UploadService;
    }

    @PostMapping(value = "/files/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadImage(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "recipes") String dir
    ) {
        return ResponseEntity.ok(s3UploadService.uploadImage(file, dir));
    }

    @GetMapping("/files/images")
    public ResponseEntity<InputStreamResource> getImage(@RequestParam String key) {
        ResponseInputStream<GetObjectResponse> image = s3UploadService.getImage(key);
        GetObjectResponse response = image.response();
        MediaType mediaType = response.contentType() != null
                ? MediaType.parseMediaType(response.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(response.contentLength())
                .body(new InputStreamResource(image));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleServerError(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
    }
}
