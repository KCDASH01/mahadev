<?php

namespace Tests\Unit;

use App\Support\IndianMobileNumber;
use PHPUnit\Framework\TestCase;

class IndianMobileNumberTest extends TestCase
{
    public function test_it_normalizes_indian_numbers(): void
    {
        $this->assertSame('9876543210', IndianMobileNumber::normalize('9876543210'));
        $this->assertSame('9876543210', IndianMobileNumber::normalize('+91 98765 43210'));
        $this->assertSame('9876543210', IndianMobileNumber::normalize('919876543210'));
        $this->assertSame('9876543210', IndianMobileNumber::normalize('09876543210'));
        $this->assertNull(IndianMobileNumber::normalize('12345'));
        $this->assertNull(IndianMobileNumber::normalize('5876543210'));
    }
}
