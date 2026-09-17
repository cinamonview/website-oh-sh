package com.ohsh.website.archive;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class ArchiveController {

    private final ArchiveService archiveService;
    private final ArchiveFileService archiveFileService;

    public ArchiveController(ArchiveService archiveService, ArchiveFileService archiveFileService) {
        this.archiveService = archiveService;
        this.archiveFileService = archiveFileService;
    }

    @PostMapping(value = "/api/archives/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "archiveId", required = false) Long archiveId,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (archiveId == null || archiveService.findById(archiveId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!archiveService.isOwner(archiveId, loginId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "업로드할 파일이 없습니다."));
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null) {
            String fileName = Paths.get(originalFileName).getFileName().toString();
            int extensionIndex = fileName.lastIndexOf('.');
            if (extensionIndex > 0) {
                fileExtension = fileName.substring(extensionIndex);
            }
        }

        String savedFileName = UUID.randomUUID() + fileExtension;
        Path uploadDirectory = Paths.get("uploads", "archive").toAbsolutePath().normalize();
        Path savedFilePath = uploadDirectory.resolve(savedFileName).normalize();

        try {
            Files.createDirectories(uploadDirectory);
            Files.copy(file.getInputStream(), savedFilePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "파일을 저장하지 못했습니다."));
        }

        ArchiveFile archiveFile = new ArchiveFile();
        archiveFile.setArchiveId(archiveId);
        archiveFile.setOriginalFileName(originalFileName == null ? "" : originalFileName);
        archiveFile.setSavedFileName(savedFileName);
        archiveFile.setFileSize(file.getSize());
        archiveFileService.save(archiveFile);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "archiveId", archiveId,
                "originalFileName", originalFileName == null ? "" : originalFileName,
                "savedFileName", savedFileName,
                "fileSize", file.getSize(),
                "downloadPath", Paths.get("uploads", "archive", savedFileName).toString()));
    }

    @PostMapping("/api/archives")
    public ResponseEntity<?> save(@RequestBody Archive archive, HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        archive.setWriter(loginId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(archiveService.save(archive));
    }

    @GetMapping("/api/archives")
    public Page<Archive> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return archiveService.findAll(pageable);
    }

    @GetMapping("/api/archives/{archiveId}/files")
    public ResponseEntity<List<ArchiveFile>> findFiles(@PathVariable Long archiveId) {
        if (archiveService.findById(archiveId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(archiveFileService.findByArchiveId(archiveId));
    }

    @GetMapping("/api/archives/files/{fileId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long fileId) {
        ArchiveFile archiveFile = archiveFileService.findById(fileId).orElse(null);
        if (archiveFile == null) {
            return ResponseEntity.notFound().build();
        }

        Path uploadDirectory = Paths.get("uploads", "archive").toAbsolutePath().normalize();
        Path savedFilePath = uploadDirectory.resolve(archiveFile.getSavedFileName()).normalize();
        if (!savedFilePath.startsWith(uploadDirectory)
                || !Files.isRegularFile(savedFilePath)) {
            return ResponseEntity.notFound().build();
        }

        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String detectedContentType = Files.probeContentType(savedFilePath);
            if (detectedContentType != null) {
                contentType = MediaType.parseMediaType(detectedContentType);
            }
        } catch (IOException | IllegalArgumentException exception) {
            contentType = MediaType.APPLICATION_OCTET_STREAM;
        }

        String downloadFileName = archiveFile.getOriginalFileName();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(contentType);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(downloadFileName, StandardCharsets.UTF_8)
                .build());

        try {
            headers.setContentLength(Files.size(savedFilePath));
        } catch (IOException exception) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .headers(headers)
                .body(new FileSystemResource(savedFilePath));
    }

    @GetMapping("/api/archives/files/{fileId}/preview")
    public ResponseEntity<Resource> preview(@PathVariable Long fileId) {
        ArchiveFile archiveFile = archiveFileService.findById(fileId).orElse(null);
        if (archiveFile == null) {
            return ResponseEntity.notFound().build();
        }

        Path uploadDirectory = Paths.get("uploads", "archive").toAbsolutePath().normalize();
        Path savedFilePath = uploadDirectory.resolve(archiveFile.getSavedFileName()).normalize();
        if (!savedFilePath.startsWith(uploadDirectory)
                || !Files.isRegularFile(savedFilePath)) {
            return ResponseEntity.notFound().build();
        }

        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String detectedContentType = Files.probeContentType(savedFilePath);
            if (detectedContentType != null) {
                contentType = MediaType.parseMediaType(detectedContentType);
            }
        } catch (IOException | IllegalArgumentException exception) {
            contentType = MediaType.APPLICATION_OCTET_STREAM;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(contentType);
        headers.setContentDisposition(ContentDisposition.inline().build());

        try {
            headers.setContentLength(Files.size(savedFilePath));
        } catch (IOException exception) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .headers(headers)
                .body(new FileSystemResource(savedFilePath));
    }

    @GetMapping("/api/archives/{id}")
    public ResponseEntity<Archive> findById(
            @PathVariable Long id,
            HttpServletRequest request,
            HttpServletResponse response) {
        return archiveService.findById(id)
                .map(archive -> {
                    String cookieName = "archive_view_" + id;
                    String today = LocalDate.now().toString();
                    Cookie[] cookies = request.getCookies();
                    boolean alreadyViewedToday = false;

                    if (cookies != null) {
                        for (Cookie cookie : cookies) {
                            if (cookieName.equals(cookie.getName()) && today.equals(cookie.getValue())) {
                                alreadyViewedToday = true;
                                break;
                            }
                        }
                    }

                    if (!alreadyViewedToday) {
                        archive.setViewCount(archive.getViewCount() == null ? 0L : archive.getViewCount() + 1L);
                        archiveService.save(archive);

                        Cookie viewCookie = new Cookie(cookieName, today);
                        viewCookie.setPath("/");
                        viewCookie.setMaxAge(60 * 60 * 24);
                        response.addCookie(viewCookie);
                    }

                    return ResponseEntity.ok(archive);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/api/archives/{id}/like")
    public ResponseEntity<?> like(@PathVariable("id") Long id, HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return archiveService.like(id)
                .map(archive -> ResponseEntity.ok(Map.of(
                        "likeCount", archive.getLikeCount() == null ? 0L : archive.getLikeCount())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/api/archives/{id}")
    public ResponseEntity<?> update(
            @PathVariable("id") Long id,
            @RequestBody Archive archive,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (archiveService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!archiveService.isOwner(id, loginId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return archiveService.update(id, archive.getTitle(), archive.getContent())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/archives/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") Long id,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (archiveService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!archiveService.isOwner(id, loginId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!archiveService.delete(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
