import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { adminSingletonUpdateUrl } from '@/components/admin/admin-destroy-form';
import ColorPickerField from '@/components/admin/color-picker-field';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { edit } from '@/routes/admin/settings/theme';
import type { ThemeSetting } from '@/types/settings';

function contrastingTextColor(hex: string): string {
    const normalized = hex.replace('#', '');
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.6 ? '#111827' : '#FFFFFF';
}

export default function ThemeSettingsPage({
    settings,
}: {
    settings: ThemeSetting;
}) {
    const [colors, setColors] = useState({
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        button_color: settings.button_color,
        header_color: settings.header_color,
        footer_color: settings.footer_color,
    });

    const updateColor = (field: keyof typeof colors, value: string) => {
        setColors((current) => ({
            ...current,
            [field]: value,
        }));
    };

    return (
        <>
            <Head title="Theme Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Theme Settings"
                    description="Customize brand colors used across the website."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Color Palette</CardTitle>
                        <CardDescription>
                            Colors are stored as HEX values and shared globally
                            in Blade views via CSS variables.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminSingletonUpdateUrl('/admin/settings/theme')}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <ColorPickerField
                                            id="primary_color"
                                            name="primary_color"
                                            label="Primary color"
                                            value={colors.primary_color}
                                            onChange={(value) =>
                                                updateColor(
                                                    'primary_color',
                                                    value,
                                                )
                                            }
                                            error={errors.primary_color}
                                        />
                                        <ColorPickerField
                                            id="secondary_color"
                                            name="secondary_color"
                                            label="Secondary color"
                                            value={colors.secondary_color}
                                            onChange={(value) =>
                                                updateColor(
                                                    'secondary_color',
                                                    value,
                                                )
                                            }
                                            error={errors.secondary_color}
                                        />
                                        <ColorPickerField
                                            id="button_color"
                                            name="button_color"
                                            label="Button color"
                                            value={colors.button_color}
                                            onChange={(value) =>
                                                updateColor(
                                                    'button_color',
                                                    value,
                                                )
                                            }
                                            error={errors.button_color}
                                        />
                                        <ColorPickerField
                                            id="header_color"
                                            name="header_color"
                                            label="Header color"
                                            value={colors.header_color}
                                            onChange={(value) =>
                                                updateColor(
                                                    'header_color',
                                                    value,
                                                )
                                            }
                                            error={errors.header_color}
                                        />
                                        <ColorPickerField
                                            id="footer_color"
                                            name="footer_color"
                                            label="Footer color"
                                            value={colors.footer_color}
                                            onChange={(value) =>
                                                updateColor(
                                                    'footer_color',
                                                    value,
                                                )
                                            }
                                            error={errors.footer_color}
                                        />
                                    </div>

                                    <div className="grid gap-3">
                                        <p className="text-sm font-medium">
                                            Preview
                                        </p>
                                        <div
                                            className="rounded-lg border p-4"
                                            style={{
                                                backgroundColor:
                                                    colors.header_color,
                                                color: colors.secondary_color,
                                            }}
                                        >
                                            <p className="text-sm font-medium">
                                                Header area
                                            </p>
                                            <button
                                                type="button"
                                                className="mt-2 rounded-md px-4 py-2 text-sm"
                                                style={{
                                                    backgroundColor:
                                                        colors.button_color,
                                                    color: contrastingTextColor(
                                                        colors.button_color,
                                                    ),
                                                }}
                                            >
                                                Sample Button
                                            </button>
                                        </div>
                                        <div
                                            className="rounded-lg border p-4 text-sm"
                                            style={{
                                                backgroundColor:
                                                    colors.footer_color,
                                                color: contrastingTextColor(
                                                    colors.footer_color,
                                                ),
                                            }}
                                        >
                                            Footer area
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        Save Theme
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ThemeSettingsPage.layout = {
    breadcrumbs: [{ title: 'Theme Settings', href: edit() }],
};
