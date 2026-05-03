CREATE TABLE IF NOT EXISTS machines (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID         NOT NULL,
    name              VARCHAR(255) NOT NULL,
    mac_address       VARCHAR(255) NOT NULL UNIQUE,
    firmware_version  VARCHAR(255),
    machine_type      VARCHAR(50)  NOT NULL,
    status            VARCHAR(50)  NOT NULL
);

CREATE TABLE IF NOT EXISTS machine_tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id    UUID         NOT NULL,
    tenant_id     UUID         NOT NULL,
    task_type     VARCHAR(50)  NOT NULL,
    reference_id  VARCHAR(255) NOT NULL,
    status        VARCHAR(50)  NOT NULL,
    started_at    TIMESTAMP WITH TIME ZONE,
    completed_at  TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS machine_telemetry (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id               UUID             NOT NULL,
    timestamp                TIMESTAMP WITH TIME ZONE NOT NULL,
    battery_level            DOUBLE PRECISION,
    cpu_temperature          DOUBLE PRECISION,
    coordinates_x            DOUBLE PRECISION,
    coordinates_y            DOUBLE PRECISION,
    network_signal_strength  DOUBLE PRECISION,
    current_error_code       VARCHAR(255),
    sensor_payload           JSONB
);
