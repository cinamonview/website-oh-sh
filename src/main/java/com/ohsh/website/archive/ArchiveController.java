package com.ohsh.website.archive;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ArchiveController {

    private final ArchiveService archiveService;

    public ArchiveController(ArchiveService archiveService) {
        this.archiveService = archiveService;
    }

    @PostMapping("/api/archives")
    public ResponseEntity<Archive> save(@RequestBody Archive archive) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(archiveService.save(archive));
    }

    @GetMapping("/api/archives")
    public List<Archive> findAll() {
        return archiveService.findAll();
    }

    @GetMapping("/api/archives/{id}")
    public ResponseEntity<Archive> findById(@PathVariable Long id) {
        return archiveService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/api/archives/{id}")
    public ResponseEntity<Archive> update(
            @PathVariable Long id,
            @RequestBody Archive archive) {
        return archiveService.update(id, archive.getTitle(), archive.getContent())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/archives/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!archiveService.delete(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
