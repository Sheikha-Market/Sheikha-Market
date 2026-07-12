#include <cairo.h>
#include <librsvg/rsvg.h>
#include <stdio.h>

int main(int argc, char **argv) {
    if (argc != 3) {
        fprintf(stderr, "usage: render_icon SOURCE.svg TARGET.png\n");
        return 64;
    }

    GError *error = NULL;
    RsvgHandle *handle = rsvg_handle_new_from_file(argv[1], &error);
    if (handle == NULL) {
        fprintf(stderr, "failed to load source icon: %s\n", error != NULL ? error->message : "unknown error");
        g_clear_error(&error);
        return 65;
    }

    cairo_surface_t *surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, 512, 512);
    cairo_t *context = cairo_create(surface);
    cairo_set_operator(context, CAIRO_OPERATOR_SOURCE);
    cairo_set_source_rgba(context, 0.0, 0.0, 0.0, 0.0);
    cairo_paint(context);
    cairo_set_operator(context, CAIRO_OPERATOR_OVER);

    const RsvgRectangle viewport = { 0.0, 0.0, 512.0, 512.0 };
    if (!rsvg_handle_render_document(handle, context, &viewport, &error)) {
        fprintf(stderr, "failed to render source icon: %s\n", error != NULL ? error->message : "unknown error");
        g_clear_error(&error);
        cairo_destroy(context);
        cairo_surface_destroy(surface);
        g_object_unref(handle);
        return 66;
    }

    cairo_surface_flush(surface);
    const cairo_status_t status = cairo_surface_write_to_png(surface, argv[2]);
    cairo_destroy(context);
    cairo_surface_destroy(surface);
    g_object_unref(handle);
    if (status != CAIRO_STATUS_SUCCESS) {
        fprintf(stderr, "failed to write target icon: %s\n", cairo_status_to_string(status));
        return 67;
    }

    return 0;
}
