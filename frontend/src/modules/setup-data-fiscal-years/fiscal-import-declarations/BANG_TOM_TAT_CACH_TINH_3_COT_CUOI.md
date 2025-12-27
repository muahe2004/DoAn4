# BẢNG TÓM TẮT: CÁCH TÍNH 3 CỘT CUỐI

## 📊 Tổng quan 3 cột

| Cột | Tên | Nguồn dữ liệu | Công thức |
|-----|-----|----------------|-----------|
| 1️⃣ | **SL THEO TK QUY ĐỔI (1)** | Tờ khai hải quan | `quantity × conversion_factor` |
| 2️⃣ | **SL THEO SỔ QUY ĐỔI (2)** | Sổ kế toán | `SUM(material_receive_details.quantity)` |
| 3️⃣ | **SAI LỆCH** | Tính toán | `(2) - (1)` |
| 4️⃣ | **CHI TIẾT SAI LỆCH** | Hiển thị | Text mô tả + % |

---

## 🔢 Chi tiết từng cột

### 1️⃣ SL THEO TK QUY ĐỔI (1)

**Mục đích:** Quy đổi số lượng từ tờ khai về đơn vị chuẩn (base unit)

**Nguồn dữ liệu:**
- `import_declaration_details.quantity` - Số lượng trên tờ khai
- `convert_units.conversion` - Hệ số quy đổi

**Công thức:**
```python
converted_declaration_quantity = quantity × conversion_factor
```

**Ví dụ:**
```
Tờ khai: 2.5 TON
Hệ số quy đổi: TON → KG = 1000
Base unit: KG

→ SL_THEO_TK_QD = 2.5 × 1000 = 2500 KG
```

**Code backend:**
```python
quantity = detail.quantity or 0              # 2.5
conversion = row[15] or 1                    # 1000
converted_declaration_qty = quantity * conversion  # 2500
```

---

### 2️⃣ SL THEO SỔ QUY ĐỔI (2)

**Mục đích:** Tổng số lượng đã nhập kho thực tế (đã ở base unit)

**Nguồn dữ liệu:**
- `material_receive_details.quantity` - Số lượng từng lần nhập kho

**Công thức SQL:**
```sql
SELECT 
    material_id,
    import_declaration_id,
    SUM(quantity) as total_accounting_qty
FROM material_receive_details
GROUP BY material_id, import_declaration_id
```

**Ví dụ:**
```
Tờ khai NK003 - Material MT001:
┌─────────┬──────────┬──────────┐
│ Lần     │ Ngày     │ SL (KG)  │
├─────────┼──────────┼──────────┤
│ Lần 1   │ 1/7/2025 │ 1000     │
│ Lần 2   │ 5/7/2025 │ 800      │
│ Lần 3   │ 10/7/2025│ 700      │
└─────────┴──────────┴──────────┘

→ SL_THEO_SO_QD = 1000 + 800 + 700 = 2500 KG
```

**Code backend:**
```python
# Subquery tính SUM
accounting_qty_subquery = (
    select(
        MaterialReceiveDetails.material_id,
        MaterialReceiveDetails.import_declaration_id,
        func.sum(MaterialReceiveDetails.quantity).label('total_accounting_qty')
    )
    .group_by(
        MaterialReceiveDetails.material_id,
        MaterialReceiveDetails.import_declaration_id
    )
    .subquery()
)

# Lấy giá trị
accounting_qty = row[17] or 0  # 2500
converted_accounting_qty = accounting_qty  # 2500 (đã ở base unit)
```

---

### 3️⃣ SAI LỆCH

**Mục đích:** So sánh chênh lệch giữa sổ sách và tờ khai

**Công thức:**
```python
variance = converted_accounting_qty - converted_declaration_qty
variance = (2) - (1)
```

**Ý nghĩa:**
- **variance > 0**: Nhập nhiều hơn tờ khai (THỪA)
- **variance < 0**: Nhập ít hơn tờ khai (THIẾU)
- **variance = 0**: Khớp chính xác

**Ví dụ:**

#### Trường hợp 1: Khớp
```
SL_THEO_TK_QD = 2500 KG
SL_THEO_SO_QD = 2500 KG
SAI_LECH = 2500 - 2500 = 0 KG
```

#### Trường hợp 2: Thừa
```
SL_THEO_TK_QD = 2000 KG
SL_THEO_SO_QD = 2500 KG
SAI_LECH = 2500 - 2000 = +500 KG (Thừa)
```

#### Trường hợp 3: Thiếu
```
SL_THEO_TK_QD = 2000 KG
SL_THEO_SO_QD = 1800 KG
SAI_LECH = 1800 - 2000 = -200 KG (Thiếu)
```

**Code backend:**
```python
variance = accounting_qty - converted_declaration_qty
# variance = 2500 - 2000 = 500
```

---

### 4️⃣ CHI TIẾT SAI LỆCH

**Mục đích:** Hiển thị text mô tả dễ hiểu cho người dùng

**Công thức:**
```typescript
if (variance === 0) {
    status = "✓ Khớp chính xác"
} else if (variance > 0) {
    percent = (variance / convertedDeclQty) × 100
    status = `↑ Nhập thừa ${variance} (${percent}%)`
} else {
    percent = (|variance| / convertedDeclQty) × 100
    status = `↓ Nhập thiếu ${|variance|} (${percent}%)`
}
```

**Ví dụ:**

#### Trường hợp 1: Khớp
```
variance = 0
→ "✓ Khớp chính xác"
```

#### Trường hợp 2: Thừa
```
convertedDeclQty = 2000
variance = 500
percent = (500 / 2000) × 100 = 25%
→ "↑ Nhập thừa 500.00 (25.0%)"
```

#### Trường hợp 3: Thiếu
```
convertedDeclQty = 2000
variance = -200
percent = (200 / 2000) × 100 = 10%
→ "↓ Nhập thiếu 200.00 (10.0%)"
```

**Code frontend:**
```typescript
if (variance === 0) {
    varianceStatus = '✓ Khớp chính xác';
    varianceColor = '#2e7d32';
    varianceBg = '#e8f5e9';
} else if (variance > 0) {
    const percent = ((variance / convertedDeclQty) * 100).toFixed(1);
    varianceStatus = `↑ Nhập thừa ${formatQuantity(variance)} (${percent}%)`;
    varianceColor = '#1976d2';
    varianceBg = '#e3f2fd';
} else {
    const percent = ((Math.abs(variance) / convertedDeclQty) * 100).toFixed(1);
    varianceStatus = `↓ Nhập thiếu ${formatQuantity(Math.abs(variance))} (${percent}%)`;
    varianceColor = '#d32f2f';
    varianceBg = '#ffebee';
}
```

---

## 📋 Ví dụ đầy đủ từ đầu đến cuối

### Dữ liệu đầu vào:

**Bảng import_declaration_details:**
| material_id | import_declaration_id | quantity | unit |
|-------------|----------------------|----------|------|
| MT001       | NK003               | 2        | TON  |

**Bảng materials:**
| id    | unit_id (base) |
|-------|----------------|
| MT001 | KG             |

**Bảng convert_units:**
| source_unit | target_unit | conversion |
|-------------|-------------|------------|
| KG          | TON         | 1000       |

**Bảng material_receive_details:**
| material_id | import_declaration_id | quantity | date    |
|-------------|----------------------|----------|---------|
| MT001       | NK003               | 1000     | 1/7     |
| MT001       | NK003               | 800      | 5/7     |
| MT001       | NK003               | 700      | 10/7    |

---

### Quá trình tính toán:

#### Bước 1: Tính SL THEO TK QUY ĐỔI (1)
```
quantity = 2 TON
conversion = 1000 (TON → KG)
→ converted_declaration_qty = 2 × 1000 = 2000 KG
```

#### Bước 2: Tính SL THEO SỔ QUY ĐỔI (2)
```sql
SELECT SUM(quantity) 
FROM material_receive_details
WHERE material_id = 'MT001' 
  AND import_declaration_id = 'NK003'
→ total_accounting_qty = 1000 + 800 + 700 = 2500 KG
```

#### Bước 3: Tính SAI LỆCH
```
variance = 2500 - 2000 = 500 KG
```

#### Bước 4: Tính CHI TIẾT SAI LỆCH
```
variance = 500 (dương)
percent = (500 / 2000) × 100 = 25%
→ "↑ Nhập thừa 500.00 (25.0%)"
```

---

### Kết quả hiển thị trên UI:

| Mã NVL | SL TK | Hệ số | **SL TK QĐ (1)** | **SL SỔ QĐ (2)** | **SAI LỆCH** | **CHI TIẾT SAI LỆCH** |
|--------|-------|-------|------------------|------------------|--------------|----------------------|
| MT001  | 2     | 1000  | **2000.00**      | **2500.00**      | **500.00**   | **↑ Nhập thừa 500.00 (25.0%)** |

---

## 🎨 Màu sắc hiển thị

| Trạng thái | Màu chữ | Màu nền | Icon |
|------------|---------|---------|------|
| Khớp       | #2e7d32 (xanh lá) | #e8f5e9 (xanh nhạt) | ✓ |
| Thừa       | #1976d2 (xanh dương) | #e3f2fd (xanh nhạt) | ↑ |
| Thiếu      | #d32f2f (đỏ) | #ffebee (đỏ nhạt) | ↓ |

---

## ✅ Tóm tắt công thức

```
1. SL_THEO_TK_QD = quantity × conversion_factor

2. SL_THEO_SO_QD = SUM(material_receive_details.quantity)
                   GROUP BY material_id, import_declaration_id

3. SAI_LECH = SL_THEO_SO_QD - SL_THEO_TK_QD

4. CHI_TIET_SAI_LECH = 
   - Nếu SAI_LECH = 0: "✓ Khớp chính xác"
   - Nếu SAI_LECH > 0: "↑ Nhập thừa X (Y%)"
   - Nếu SAI_LECH < 0: "↓ Nhập thiếu X (Y%)"
   
   Với: Y% = (|SAI_LECH| / SL_THEO_TK_QD) × 100
```

---

## 🔍 Lưu ý quan trọng

1. **Đơn vị thống nhất**: Tất cả số liệu cuối cùng đều ở base unit (KG, M, L...)
2. **GROUP BY đúng**: Phải group theo cả `material_id` VÀ `import_declaration_id`
3. **Không lưu DB**: Tất cả tính toán chỉ ở runtime
4. **NULL handling**: Xử lý trường hợp không có dữ liệu (mặc định = 0)
5. **Precision**: Format số với 2 chữ số thập phân
