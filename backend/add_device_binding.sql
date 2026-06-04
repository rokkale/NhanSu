-- Thêm 2 cột device binding vào bảng users
ALTER TABLE users
    ADD device_id       NVARCHAR(100) NULL,
        device_bound_at DATETIME2     NULL;
