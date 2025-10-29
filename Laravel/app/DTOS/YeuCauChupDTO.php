<?php

namespace App\DTOs;

class YeuCauChupDTO
{
    public string $Ma_KH;
    public string $Ma_NAG;
    public ?string $Loai_Chup;
    public ?string $Dia_Diem;
    public string $Bat_Dau_Chup;
    public string $Ket_Thuc_Chup;
    public ?string $Ghi_Chu;

    public function __construct(array $data)
    {
        $this->Ma_KH = $data['Ma_KH'];
        $this->Ma_NAG = $data['Ma_NAG'];
        $this->Loai_Chup = $data['Loai_Chup'] ?? null;
        $this->Dia_Diem = $data['Dia_Diem'] ?? null;
        $this->Bat_Dau_Chup = $data['Bat_Dau_Chup'];
        $this->Ket_Thuc_Chup = $data['Ket_Thuc_Chup'];
        $this->Ghi_Chu = $data['Ghi_Chu'] ?? null;
    }
}
