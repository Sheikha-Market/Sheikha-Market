#define _POSIX_C_SOURCE 200809L

#include <dlfcn.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define SHEIKHA_DESKTOP_VERSION "1.0.51"
#define DEFAULT_URL "http://127.0.0.1:8080/"
#define WEBKIT_LOAD_FINISHED 3
#define POLICY_NAVIGATION_ACTION 0
#define POLICY_NEW_WINDOW_ACTION 1

typedef int gboolean;
typedef unsigned int guint;
typedef unsigned long gulong;
typedef void *gpointer;
typedef void (*GCallback)(void);
typedef gboolean (*GSourceFunc)(gpointer);

typedef struct GtkWidget GtkWidget;
typedef struct GtkWindow GtkWindow;
typedef struct GtkContainer GtkContainer;
typedef struct WebKitWebView WebKitWebView;
typedef struct WebKitSettings WebKitSettings;
typedef struct WebKitWebContext WebKitWebContext;
typedef struct WebKitPolicyDecision WebKitPolicyDecision;
typedef struct WebKitNavigationPolicyDecision WebKitNavigationPolicyDecision;
typedef struct WebKitURIRequest WebKitURIRequest;
typedef struct WebKitDownload WebKitDownload;
typedef struct WebKitPermissionRequest WebKitPermissionRequest;

static void *gtk_library;
static void *webkit_library;
static void *gobject_library;
static void *glib_library;

static gboolean (*gtk_init_check_fn)(int *, char ***);
static GtkWidget *(*gtk_window_new_fn)(int);
static void (*gtk_window_set_default_size_fn)(GtkWindow *, int, int);
static void (*gtk_window_set_title_fn)(GtkWindow *, const char *);
static void (*gtk_container_add_fn)(GtkContainer *, GtkWidget *);
static void (*gtk_widget_show_all_fn)(GtkWidget *);
static void (*gtk_main_fn)(void);
static void (*gtk_main_quit_fn)(void);
static guint (*gtk_get_major_version_fn)(void);
static guint (*gtk_get_minor_version_fn)(void);
static guint (*gtk_get_micro_version_fn)(void);

static WebKitWebView *(*webkit_web_view_new_fn)(void);
static void (*webkit_web_view_load_uri_fn)(WebKitWebView *, const char *);
static WebKitSettings *(*webkit_web_view_get_settings_fn)(WebKitWebView *);
static WebKitWebContext *(*webkit_web_context_get_default_fn)(void);
static void (*webkit_web_context_set_sandbox_enabled_fn)(WebKitWebContext *, gboolean);
static void (*webkit_settings_set_enable_developer_extras_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_enable_javascript_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_javascript_can_access_clipboard_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_enable_webgl_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_enable_webaudio_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_enable_media_stream_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_enable_site_specific_quirks_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_enable_write_console_messages_to_stdout_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_allow_file_access_from_file_urls_fn)(WebKitSettings *, gboolean);
static void (*webkit_settings_set_allow_universal_access_from_file_urls_fn)(WebKitSettings *, gboolean);
static WebKitURIRequest *(*webkit_navigation_policy_decision_get_request_fn)(WebKitNavigationPolicyDecision *);
static const char *(*webkit_uri_request_get_uri_fn)(WebKitURIRequest *);
static void (*webkit_policy_decision_ignore_fn)(WebKitPolicyDecision *);
static void (*webkit_download_cancel_fn)(WebKitDownload *);
static void (*webkit_permission_request_deny_fn)(WebKitPermissionRequest *);
static guint (*webkit_get_major_version_fn)(void);
static guint (*webkit_get_minor_version_fn)(void);
static guint (*webkit_get_micro_version_fn)(void);

static gulong (*g_signal_connect_data_fn)(gpointer, const char *, GCallback, gpointer, gpointer, int);
static guint (*g_timeout_add_fn)(guint, GSourceFunc, gpointer);

static bool smoke_mode;
static bool load_finished;
static bool load_failed;
static bool navigation_blocked;

static void close_libraries(void) {
  if (webkit_library) dlclose(webkit_library);
  if (gtk_library) dlclose(gtk_library);
  if (gobject_library) dlclose(gobject_library);
  if (glib_library) dlclose(glib_library);
}

static bool load_symbol(void *library, const char *name, void *target, size_t target_size) {
  void *symbol = dlsym(library, name);
  if (!symbol || target_size != sizeof(symbol)) {
    fprintf(stderr, "SHEIKHA_NATIVE_DESKTOP_SYMBOL_MISSING:%s\n", name);
    return false;
  }
  memcpy(target, &symbol, sizeof(symbol));
  return true;
}

#define LOAD(library, symbol) \
  do { \
    if (!load_symbol((library), #symbol, &(symbol##_fn), sizeof(symbol##_fn))) return false; \
  } while (0)

static bool load_runtime(void) {
  gtk_library = dlopen("libgtk-3.so.0", RTLD_NOW | RTLD_LOCAL);
  webkit_library = dlopen("libwebkit2gtk-4.0.so.37", RTLD_NOW | RTLD_LOCAL);
  gobject_library = dlopen("libgobject-2.0.so.0", RTLD_NOW | RTLD_LOCAL);
  glib_library = dlopen("libglib-2.0.so.0", RTLD_NOW | RTLD_LOCAL);
  if (!gtk_library || !webkit_library || !gobject_library || !glib_library) {
    fprintf(stderr, "SHEIKHA_NATIVE_DESKTOP_RUNTIME_MISSING:%s\n", dlerror());
    return false;
  }

  LOAD(gtk_library, gtk_init_check);
  LOAD(gtk_library, gtk_window_new);
  LOAD(gtk_library, gtk_window_set_default_size);
  LOAD(gtk_library, gtk_window_set_title);
  LOAD(gtk_library, gtk_container_add);
  LOAD(gtk_library, gtk_widget_show_all);
  LOAD(gtk_library, gtk_main);
  LOAD(gtk_library, gtk_main_quit);
  LOAD(gtk_library, gtk_get_major_version);
  LOAD(gtk_library, gtk_get_minor_version);
  LOAD(gtk_library, gtk_get_micro_version);

  LOAD(webkit_library, webkit_web_view_new);
  LOAD(webkit_library, webkit_web_view_load_uri);
  LOAD(webkit_library, webkit_web_view_get_settings);
  LOAD(webkit_library, webkit_web_context_get_default);
  LOAD(webkit_library, webkit_web_context_set_sandbox_enabled);
  LOAD(webkit_library, webkit_settings_set_enable_developer_extras);
  LOAD(webkit_library, webkit_settings_set_enable_javascript);
  LOAD(webkit_library, webkit_settings_set_javascript_can_access_clipboard);
  LOAD(webkit_library, webkit_settings_set_enable_webgl);
  LOAD(webkit_library, webkit_settings_set_enable_webaudio);
  LOAD(webkit_library, webkit_settings_set_enable_media_stream);
  LOAD(webkit_library, webkit_settings_set_enable_site_specific_quirks);
  LOAD(webkit_library, webkit_settings_set_enable_write_console_messages_to_stdout);
  LOAD(webkit_library, webkit_settings_set_allow_file_access_from_file_urls);
  LOAD(webkit_library, webkit_settings_set_allow_universal_access_from_file_urls);
  LOAD(webkit_library, webkit_navigation_policy_decision_get_request);
  LOAD(webkit_library, webkit_uri_request_get_uri);
  LOAD(webkit_library, webkit_policy_decision_ignore);
  LOAD(webkit_library, webkit_download_cancel);
  LOAD(webkit_library, webkit_permission_request_deny);
  LOAD(webkit_library, webkit_get_major_version);
  LOAD(webkit_library, webkit_get_minor_version);
  LOAD(webkit_library, webkit_get_micro_version);

  LOAD(gobject_library, g_signal_connect_data);
  LOAD(glib_library, g_timeout_add);
  return true;
}

static bool local_url_allowed(const char *uri) {
  static const char *allowed[] = {
    "http://127.0.0.1:8080",
    "http://localhost:8080"
  };
  if (!uri) return false;
  if (strcmp(uri, "about:blank") == 0) return true;
  for (size_t index = 0; index < sizeof(allowed) / sizeof(allowed[0]); index += 1) {
    const size_t length = strlen(allowed[index]);
    if (strncmp(uri, allowed[index], length) == 0 &&
        (uri[length] == '\0' || uri[length] == '/' || uri[length] == '?' || uri[length] == '#')) {
      return true;
    }
  }
  return false;
}

static void on_destroy(GtkWidget *widget, gpointer data) {
  (void)widget;
  (void)data;
  gtk_main_quit_fn();
}

static gboolean finish_smoke(gpointer data) {
  (void)data;
  if (load_finished && !load_failed) {
    puts("SHEIKHA_NATIVE_DESKTOP_SMOKE_OK");
  } else {
    puts("SHEIKHA_NATIVE_DESKTOP_SMOKE_FAILED");
  }
  fflush(stdout);
  gtk_main_quit_fn();
  return 0;
}

static gboolean smoke_timeout(gpointer data) {
  (void)data;
  if (!load_finished) load_failed = true;
  return finish_smoke(NULL);
}

static void on_load_changed(WebKitWebView *view, int event, gpointer data) {
  (void)view;
  (void)data;
  if (event == WEBKIT_LOAD_FINISHED) {
    load_finished = true;
    if (smoke_mode) g_timeout_add_fn(500, finish_smoke, NULL);
  }
}

static gboolean on_load_failed(
  WebKitWebView *view,
  int event,
  const char *failing_uri,
  gpointer error,
  gpointer data
) {
  (void)view;
  (void)event;
  (void)error;
  (void)data;
  load_failed = true;
  fprintf(stderr, "SHEIKHA_NATIVE_DESKTOP_LOAD_FAILED:%s\n", failing_uri ? failing_uri : "unknown");
  if (smoke_mode) g_timeout_add_fn(1, finish_smoke, NULL);
  return 0;
}

static gboolean on_decide_policy(
  WebKitWebView *view,
  WebKitPolicyDecision *decision,
  int decision_type,
  gpointer data
) {
  (void)view;
  (void)data;
  if (decision_type != POLICY_NAVIGATION_ACTION && decision_type != POLICY_NEW_WINDOW_ACTION) return 0;
  WebKitURIRequest *request = webkit_navigation_policy_decision_get_request_fn(
    (WebKitNavigationPolicyDecision *)decision
  );
  const char *uri = request ? webkit_uri_request_get_uri_fn(request) : NULL;
  if (decision_type == POLICY_NEW_WINDOW_ACTION || !local_url_allowed(uri)) {
    navigation_blocked = true;
    webkit_policy_decision_ignore_fn(decision);
    fprintf(stderr, "SHEIKHA_NATIVE_DESKTOP_NAVIGATION_BLOCKED\n");
    return 1;
  }
  return 0;
}

static gboolean on_permission_request(
  WebKitWebView *view,
  WebKitPermissionRequest *request,
  gpointer data
) {
  (void)view;
  (void)data;
  webkit_permission_request_deny_fn(request);
  return 1;
}

static void on_download_started(
  WebKitWebContext *context,
  WebKitDownload *download,
  gpointer data
) {
  (void)context;
  (void)data;
  webkit_download_cancel_fn(download);
}

static WebKitWebView *on_create(
  WebKitWebView *view,
  gpointer navigation_action,
  gpointer data
) {
  (void)view;
  (void)navigation_action;
  (void)data;
  navigation_blocked = true;
  return NULL;
}

static gboolean on_context_menu(
  WebKitWebView *view,
  gpointer context_menu,
  gpointer event,
  gpointer hit_test,
  gpointer data
) {
  (void)view;
  (void)context_menu;
  (void)event;
  (void)hit_test;
  (void)data;
  return 1;
}

static void connect_signal(gpointer instance, const char *name, GCallback callback) {
  g_signal_connect_data_fn(instance, name, callback, NULL, NULL, 0);
}

static void print_probe(void) {
  printf(
    "{\"system\":\"SHEIKHA_NATIVE_DESKTOP_LINUX_V31\","
    "\"version\":\"%s\",\"architecture\":\"x86_64\","
    "\"gtk\":\"%u.%u.%u\",\"webkit\":\"%u.%u.%u\","
    "\"nativeBridge\":false,\"loopbackOnly\":true}\n",
    SHEIKHA_DESKTOP_VERSION,
    gtk_get_major_version_fn(), gtk_get_minor_version_fn(), gtk_get_micro_version_fn(),
    webkit_get_major_version_fn(), webkit_get_minor_version_fn(), webkit_get_micro_version_fn()
  );
  puts("SHEIKHA_NATIVE_DESKTOP_PROBE_OK");
}

static void usage(const char *program) {
  printf("Usage: %s [--probe|--version|--smoke] [--url http://127.0.0.1:8080/]\n", program);
}

int main(int argc, char **argv) {
  const char *url = DEFAULT_URL;
  bool probe_mode = false;
  for (int index = 1; index < argc; index += 1) {
    if (strcmp(argv[index], "--probe") == 0) probe_mode = true;
    else if (strcmp(argv[index], "--smoke") == 0) smoke_mode = true;
    else if (strcmp(argv[index], "--version") == 0) {
      printf("sheikha-native-desktop %s linux-x86_64\n", SHEIKHA_DESKTOP_VERSION);
      return 0;
    } else if (strcmp(argv[index], "--url") == 0 && index + 1 < argc) {
      url = argv[++index];
    } else if (strcmp(argv[index], "--help") == 0) {
      usage(argv[0]);
      return 0;
    } else {
      usage(argv[0]);
      return 64;
    }
  }

  if (!local_url_allowed(url)) {
    fputs("SHEIKHA_NATIVE_DESKTOP_URL_DENIED\n", stderr);
    return 65;
  }
  if (!load_runtime()) {
    close_libraries();
    return 66;
  }
  if (probe_mode) {
    print_probe();
    close_libraries();
    return 0;
  }
  if (!gtk_init_check_fn(&argc, &argv)) {
    fputs("SHEIKHA_NATIVE_DESKTOP_DISPLAY_UNAVAILABLE\n", stderr);
    close_libraries();
    return 67;
  }

  WebKitWebContext *context = webkit_web_context_get_default_fn();
  webkit_web_context_set_sandbox_enabled_fn(context, 1);
  GtkWidget *window = gtk_window_new_fn(0);
  WebKitWebView *web_view = webkit_web_view_new_fn();
  if (!window || !web_view) {
    fputs("SHEIKHA_NATIVE_DESKTOP_WINDOW_CREATION_FAILED\n", stderr);
    close_libraries();
    return 68;
  }

  WebKitSettings *settings = webkit_web_view_get_settings_fn(web_view);
  webkit_settings_set_enable_developer_extras_fn(settings, 0);
  webkit_settings_set_enable_javascript_fn(settings, 1);
  webkit_settings_set_javascript_can_access_clipboard_fn(settings, 0);
  webkit_settings_set_enable_webgl_fn(settings, 0);
  webkit_settings_set_enable_webaudio_fn(settings, 0);
  webkit_settings_set_enable_media_stream_fn(settings, 0);
  webkit_settings_set_enable_site_specific_quirks_fn(settings, 0);
  webkit_settings_set_enable_write_console_messages_to_stdout_fn(settings, 0);
  webkit_settings_set_allow_file_access_from_file_urls_fn(settings, 0);
  webkit_settings_set_allow_universal_access_from_file_urls_fn(settings, 0);

  gtk_window_set_title_fn((GtkWindow *)window, "Sheikha Native Desktop");
  gtk_window_set_default_size_fn((GtkWindow *)window, 1280, 820);
  gtk_container_add_fn((GtkContainer *)window, (GtkWidget *)web_view);

  connect_signal(window, "destroy", (GCallback)on_destroy);
  connect_signal(web_view, "load-changed", (GCallback)on_load_changed);
  connect_signal(web_view, "load-failed", (GCallback)on_load_failed);
  connect_signal(web_view, "decide-policy", (GCallback)on_decide_policy);
  connect_signal(web_view, "permission-request", (GCallback)on_permission_request);
  connect_signal(web_view, "create", (GCallback)on_create);
  connect_signal(web_view, "context-menu", (GCallback)on_context_menu);
  connect_signal(context, "download-started", (GCallback)on_download_started);

  webkit_web_view_load_uri_fn(web_view, url);
  gtk_widget_show_all_fn(window);
  puts("SHEIKHA_NATIVE_DESKTOP_LAUNCH_OK");
  fflush(stdout);
  if (smoke_mode) g_timeout_add_fn(20000, smoke_timeout, NULL);
  gtk_main_fn();

  const int exit_code = smoke_mode && (!load_finished || load_failed || navigation_blocked) ? 2 : 0;
  close_libraries();
  return exit_code;
}
