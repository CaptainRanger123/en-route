from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DEBUG = False

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [Path.joinpath(BASE_DIR, "frontend", "gui", "dist")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "en-route",
        "USER": "",
        "PASSWORD": "",
        "HOST": "localhost",
        "PORT": 5432
    }
}

STATIC_URL = "/static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = Path.joinpath(BASE_DIR, "media")

STATICFILES_DIRS = [
    Path.joinpath(BASE_DIR, "frontend", "gui", "dist", "assets"),
    Path.joinpath(BASE_DIR, "frontend", "gui", "dist")
]

STATIC_ROOT = Path.joinpath(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
