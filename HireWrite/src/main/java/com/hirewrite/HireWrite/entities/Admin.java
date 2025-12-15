package com.hirewrite.HireWrite.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "AdminAudit")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "actor_user_id", length = 36)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID actorUserId;

    @Column(name = "action", columnDefinition = "TEXT")
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type")
    private TargetType targetType;

    @Column(name = "target_id", length = 36)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID targetId;

    @Column(name = "payload_json", columnDefinition = "JSON")
    private String payloadJson;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private LocalDateTime updatedBy;

//    @Column(name = "col1", length = 255)
//    private String col1;
//
//    @Column(name = "col2", length = 255)
//    private String col2;
//
//    @Column(name = "col3", length = 255)
//    private String col3;
//
//    @Column(name = "col4", length = 255)
//    private String col4;

    public enum TargetType {
        user, company, job, application
    }
}