package com.ohsh.website.archive;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArchiveFileRepository extends JpaRepository<ArchiveFile, Long> {

    List<ArchiveFile> findByArchiveId(Long archiveId);
}