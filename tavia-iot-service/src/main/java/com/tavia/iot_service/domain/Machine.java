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

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    @Column(name = "mac_address", nullable = false, unique = true)
    private String macAddress;

    @Column(name = "firmware_version")
    private String firmwareVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "machine_type", nullable = false)
    private MachineType machineType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MachineStatus status;
}
