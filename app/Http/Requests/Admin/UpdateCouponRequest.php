<?php

namespace App\Http\Requests\Admin;

use App\Models\Coupon;

class UpdateCouponRequest extends StoreCouponRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Coupon $coupon */
        $coupon = $this->route('coupon');

        return $this->couponRules($coupon->id);
    }
}
