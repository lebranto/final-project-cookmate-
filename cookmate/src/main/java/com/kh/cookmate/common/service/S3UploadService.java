package com.kh.cookmate.common.service;

import java.io.IOException;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.kh.cookmate.common.dto.FileUploadDto.ImageUploadResponse;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3UploadService {

    private static final DateTimeFormatter FILE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    private final S3Client s3Client;
    private final String bucket;
    private final String region;
    private final String baseUrl;
    private final String apiBaseUrl;

    public S3UploadService(
            S3Client s3Client,
            @Value("${aws.s3.bucket:}") String bucket,
            @Value("${aws.s3.region:ap-northeast-2}") String region,
            @Value("${aws.s3.base-url:}") String baseUrl,
            @Value("${app.api.base-url:http://localhost:8081/api}") String apiBaseUrl
    ) {
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.region = region;
        this.baseUrl = baseUrl;
        this.apiBaseUrl = apiBaseUrl;
    }

    public ImageUploadResponse uploadImage(MultipartFile file, String dir) {
        validateImage(file);

        if (!hasText(bucket)) {
            throw new IllegalStateException("S3 bucket is not configured.");
        }

        String cleanDir = sanitizeDir(dir);
        String extension = extractExtension(file.getOriginalFilename());
        String fileName = createFileName(extension);
        String fileKey = cleanDir + "/" + fileName;
        String contentType = file.getContentType();

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileKey)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

            return new ImageUploadResponse(
                    fileName,
                    fileKey,
                    buildFileUrl(fileKey),
                    file.getSize(),
                    contentType
            );
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read image file.", e);
        }
    }

    public ResponseInputStream<GetObjectResponse> getImage(String key) {
        String cleanKey = sanitizeKey(key);
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(cleanKey)
                .build();

        return s3Client.getObject(request);
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required.");
        }

        String contentType = file.getContentType();
        if (!hasText(contentType) || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Only image files can be uploaded.");
        }

        extractExtension(file.getOriginalFilename());
    }

    private String createFileName(String extension) {
        String time = LocalDateTime.now().format(FILE_TIME_FORMAT);
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return time + "_" + suffix + "." + extension;
    }

    private String extractExtension(String originalName) {
        if (!hasText(originalName) || !originalName.contains(".")) {
            throw new IllegalArgumentException("Image file extension is required.");
        }

        String extension = originalName.substring(originalName.lastIndexOf('.') + 1)
                .toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported image extension.");
        }

        return extension;
    }

    private String sanitizeDir(String dir) {
        if (!hasText(dir)) {
            return "recipes";
        }

        String cleanDir = dir.replace("\\", "/")
                .replaceAll("^/+", "")
                .replaceAll("/+$", "");

        if (!cleanDir.matches("[a-zA-Z0-9/_-]+") || cleanDir.contains("..")) {
            return "recipes";
        }

        return cleanDir;
    }

    private String buildFileUrl(String fileKey) {
        if (hasText(baseUrl)) {
            return baseUrl.replaceAll("/+$", "") + "/" + fileKey;
        }

        return apiBaseUrl.replaceAll("/+$", "") + "/files/images?key="
                + URLEncoder.encode(fileKey, java.nio.charset.StandardCharsets.UTF_8);
    }

    private String sanitizeKey(String key) {
        if (!hasText(key)) {
            throw new IllegalArgumentException("Image key is required.");
        }

        String cleanKey = key.replace("\\", "/").replaceAll("^/+", "");
        if (!cleanKey.matches("[a-zA-Z0-9/_\\.\\-]+") || cleanKey.contains("..")) {
            throw new IllegalArgumentException("Invalid image key.");
        }

        return cleanKey;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
