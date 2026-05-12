package com.kh.cookmate.common.dto;

public class FileUploadDto {

    public record ImageUploadResponse(
            String fileName,
            String fileKey,
            String fileUrl,
            long fileSize,
            String contentType
    ) {
    }
}
