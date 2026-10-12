<?php

namespace App\Http\Requests\Admin;

class UpdateShippingRuleRequest extends StoreShippingRuleRequest
{
    // Validation rules and overlap check are inherited.
    // The overlap check already excludes the rule being updated
    // via the `shipping_rule` route parameter.
}
