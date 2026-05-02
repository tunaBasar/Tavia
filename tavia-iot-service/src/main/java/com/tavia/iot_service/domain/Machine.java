package com.tavia.iot_service.domain;

import com.tavia.iot_service.domain.enums.MachineStatus;
import com.tavia.iot_service.domain.enums.MachineType;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Machine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String macAddress;

    private String firmwareVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MachineType machineType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MachineStatus status;
}
