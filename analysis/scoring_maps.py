"""Item scoring tables, transcribed from the TypeScript instrument.

Source of truth: ``src/lib/scoring/score-maps.ts`` and
``src/lib/scoring/dimensions.ts``. This module is a faithful transcription, not
a re-design: any divergence is a bug. ``test_analysis.py`` re-parses the
TypeScript files and fails if the two copies drift apart, so the confirmatory
analysis cannot silently score an item differently from the application that
collected it.
"""

from __future__ import annotations

from typing import Callable, Mapping, Sequence

# --- Missing codes -----------------------------------------------------------

MISSING_VALUES: frozenset[str] = frozenset(
    {"", "ne_sait_pas", "sans_reponse", "prefere_ne_pas_repondre", "ne_souhaite_pas"}
)

# --- Ordinal choice items ----------------------------------------------------

ITEM_SCORE_MAPS: dict[str, dict[str, float]] = {
    # CRS-5 (Huber & Huber 2012 recoding)
    "crs_intellect": {
        "jamais": 1,
        "rarement": 2,
        "occasionnellement": 3,
        "souvent": 4,
        "tres_souvent": 5,
    },
    "crs_ideology": {
        "pas_du_tout": 1,
        "peu": 2,
        "moderement": 3,
        "beaucoup": 4,
        "totalement": 5,
    },
    "crs_public_practice": {
        "pluri_hebdo": 5,
        "hebdo": 4,
        "mensuel": 3,
        "quelques_fois_an": 2,
        "rarement": 2,
        "jamais": 1,
    },
    "crs_private_practice": {
        "pluri_quotidien": 5,
        "quotidien": 5,
        "hebdomadaire": 4,
        "mensuel": 3,
        "rarement": 2,
        "jamais": 1,
    },
    "crs_experience": {
        "jamais": 1,
        "rarement": 2,
        "occasionnellement": 3,
        "souvent": 4,
        "tres_souvent": 5,
    },
    # AI openness
    "ctrl_ia_frequence": {
        "jamais": 1,
        "essaye": 2,
        "occasionnel": 3,
        "regulier": 4,
        "quotidien": 5,
    },
    "digital_attitude_generale": {
        "tres_negatif": 1,
        "negatif": 2,
        "neutre": 3,
        "positif": 4,
        "tres_positif": 5,
    },
    "min_pred_usage": {
        "jamais": 1,
        "rare": 2,
        "regulier": 4,
        "systematique": 5,
    },
    # Sacred boundary (5 = strongest boundary)
    "theo_inspiration": {
        "impossible": 5,
        "peu_probable": 4,
        "possible_indirect": 2,
        "possible": 1,
    },
    "theo_mediation_humaine": {
        "oui_absolument": 5,
        "oui_pour_essentiel": 4,
        "partiellement": 2,
        "non_pas_necessairement": 1,
    },
    "min_care_email": {
        "non": 5,
        "oui_relu": 3,
        "oui_tel_quel": 1,
        "non_jamais": 5,
        "oui_brouillon": 3,
    },
    "laic_substitution_priere": {
        "non": 5,
        "oui_negatif": 3,
        "oui_neutre": 2,
        "oui_positif": 1,
    },
    "laic_conseil_spirituel": {
        "jamais": 5,
        "complement": 3,
        "oui_possible": 2,
        "deja_fait": 1,
    },
    # Ethical concern (5 = most concerned)
    "theo_utilite_percue": {
        "tres_negatif": 5,
        "negatif": 4,
        "neutre": 3,
        "positif": 2,
        "tres_positif": 1,
    },
    "psych_aias_opacity": {
        "non_confiance": 1,
        "non_indifferent": 1.5,
        "peu": 2.5,
        "oui_moderement": 4,
        "oui_fortement": 5,
    },
    "psych_imago_dei": {
        "pas_du_tout": 1,
        "peu": 2,
        "moderement": 3,
        "beaucoup": 4,
        "totalement": 5,
    },
    # Psychological perception (5 = most human-like attribution)
    "psych_godspeed_nature": {
        "1_machine": 1,
        "2_machine_plus": 2,
        "3_neutre": 3,
        "4_humain_moins": 4,
        "5_humain": 5,
    },
    "psych_godspeed_conscience": {
        "impossible": 1,
        "imitation": 2,
        "incertain": 3,
        "possible_emergence": 4,
        "probable": 5,
    },
    "psych_anxiete_remplacement": {
        "non_impossible": 1,
        "non_peu_probable": 2,
        "possible_partiel": 3,
        "oui_probable": 4,
        "oui_certain": 5,
    },
    # Community context
    "communaute_position_officielle": {
        "oui_defavorable": 1,
        "oui_prudent": 3,
        "oui_favorable": 5,
    },
    "communaute_perception_pairs": {
        "hostile": 1,
        "mefiant": 2,
        "neutre": 3,
        "opinions_variees": 3,
        "favorable": 4,
        "tres_favorable": 5,
    },
    "communaute_discussions": {
        "jamais": 1,
        "rarement": 2,
        "parfois": 3,
        "souvent": 4,
        "organise": 5,
    },
    # Future orientation
    "futur_intention_usage": {
        "non_certain": 1,
        "non_probable": 2,
        "peut_etre": 3,
        "oui_probable": 4,
        "oui_certain": 5,
    },
    "futur_formation_souhait": {
        "non_pas_du_tout": 1,
        "non_pas_vraiment": 2,
        "peut_etre": 3,
        "oui_assez": 4,
        "oui_tres": 5,
    },
}

# Valid answers that carry no position on the underlying continuum.
UNSCORED_OPTIONS: dict[str, tuple[str, ...]] = {
    "communaute_position_officielle": ("non",),
}

# --- Numeric scale items (1-5 sliders) ---------------------------------------

SCALE_ITEM_REVERSED: dict[str, bool] = {
    "ctrl_ia_confort": False,
    "min_admin_burden": False,
    "min_pred_sentiment": False,
    "theo_liturgie_ia": True,
}

SCALE_MIN = 1.0
SCALE_MAX = 5.0

# --- Count items (multi-select) ----------------------------------------------

EXCLUSIVE_OPTION_PREFIX = "aucun"

COUNT_ITEM_SPECS: dict[str, dict[str, object]] = {
    "ctrl_ia_contextes": {"exclusive": (), "step": 0.8, "floor": 1.0},
    "theo_activites_sacrees": {"exclusive": ("aucune",), "step": 0.9, "floor": 1.0},
    "futur_domaines_interet": {
        "exclusive": ("aucun_domaines", "aucun"),
        "step": 0.6,
        "floor": 1.0,
    },
}

# --- Matrix items ------------------------------------------------------------

MATRIX_TASK_WEIGHTS: dict[str, dict[str, float]] = {
    "min_pred_nature": {
        "plan": 1,
        "exegese": 2,
        "illustration": 1,
        "images": 1,
        "redaction": 3,
    },
}

MATRIX_MAX_LEVEL = 3

# --- Routing predicates ------------------------------------------------------

CLERGY_STATUSES: tuple[str, ...] = ("clerge", "religieux", "responsable_non_ordonne")
LAY_STATUSES: tuple[str, ...] = ("laic_engagé", "laic_pratiquant", "curieux")

Answers = Mapping[str, object]


def _as_str(answers: Answers, key: str) -> str:
    value = answers.get(key)
    return value if isinstance(value, str) else ""


def is_clergy(answers: Answers) -> bool:
    return _as_str(answers, "profil_statut") in CLERGY_STATUSES


def is_layperson(answers: Answers) -> bool:
    return _as_str(answers, "profil_statut") in LAY_STATUSES


def uses_ai_at_all(answers: Answers) -> bool:
    freq = _as_str(answers, "ctrl_ia_frequence")
    return freq not in ("", "jamais")


def clergy_uses_ai(answers: Answers) -> bool:
    usage = _as_str(answers, "min_pred_usage")
    return is_clergy(answers) and usage not in ("", "jamais")


# --- Item -> dimension map ---------------------------------------------------


class ItemSpec:
    """One item inside one dimension (mirror of ``DimensionItemSpec``)."""

    __slots__ = ("item_id", "weight", "applicable", "core")

    def __init__(
        self,
        item_id: str,
        weight: float = 1.0,
        applicable: Callable[[Answers], bool] | None = None,
        core: bool = False,
    ) -> None:
        self.item_id = item_id
        self.weight = weight
        self.applicable = applicable
        self.core = core


DIMENSION_ITEM_SPECS: dict[str, tuple[ItemSpec, ...]] = {
    "religiosity": (
        ItemSpec("crs_intellect", core=True),
        ItemSpec("crs_ideology", core=True),
        ItemSpec("crs_public_practice", core=True),
        ItemSpec("crs_private_practice", core=True),
        ItemSpec("crs_experience", core=True),
    ),
    "aiOpenness": (
        ItemSpec("ctrl_ia_frequence", core=True),
        ItemSpec("ctrl_ia_confort", core=True),
        ItemSpec("digital_attitude_generale", core=True),
        ItemSpec("ctrl_ia_contextes", applicable=uses_ai_at_all),
        ItemSpec("min_pred_usage", applicable=is_clergy),
        ItemSpec("min_pred_nature", applicable=clergy_uses_ai),
        ItemSpec("min_admin_burden", weight=0.5, applicable=clergy_uses_ai),
    ),
    "sacredBoundary": (
        ItemSpec("theo_inspiration", core=True),
        ItemSpec("theo_liturgie_ia", core=True),
        ItemSpec("theo_activites_sacrees", core=True),
        ItemSpec("theo_mediation_humaine", core=True),
        ItemSpec("min_pred_sentiment", applicable=clergy_uses_ai),
        ItemSpec("min_care_email", applicable=is_clergy),
        ItemSpec("laic_substitution_priere", applicable=is_layperson),
        ItemSpec("laic_conseil_spirituel", applicable=is_layperson),
    ),
    "ethicalConcern": (
        ItemSpec("theo_utilite_percue", core=True),
        ItemSpec("psych_aias_opacity", core=True),
        ItemSpec("psych_imago_dei", core=True),
    ),
    "psychologicalPerception": (
        ItemSpec("psych_godspeed_nature", core=True),
        ItemSpec("psych_godspeed_conscience", core=True),
        ItemSpec("psych_anxiete_remplacement", core=True),
    ),
    "communityContext": (
        ItemSpec("communaute_position_officielle", core=True),
        ItemSpec("communaute_perception_pairs", core=True),
        ItemSpec("communaute_discussions", core=True),
    ),
    "futureOrientation": (
        ItemSpec("futur_intention_usage", core=True),
        ItemSpec("futur_formation_souhait", core=True),
        ItemSpec("futur_domaines_interet", core=True),
    ),
}

DIMENSION_KEYS: tuple[str, ...] = (
    "religiosity",
    "aiOpenness",
    "sacredBoundary",
    "ethicalConcern",
    "psychologicalPerception",
    "communityContext",
    "futureOrientation",
)

MIN_ITEMS = 2
MIN_ITEMS_RELIGIOSITY = 4

MIN_ITEMS_BY_DIMENSION: dict[str, int] = {
    key: (MIN_ITEMS_RELIGIOSITY if key == "religiosity" else MIN_ITEMS)
    for key in DIMENSION_KEYS
}

CORE_SUBSCORES: dict[str, str] = {
    "sacredBoundaryCore": "sacredBoundary",
    "aiOpennessCore": "aiOpenness",
}

# --- Social desirability (Marlowe-Crowne ad hoc five) ------------------------

MC_KEYED_RESPONSES: dict[str, str] = {
    "ctrl_mc_1": "false",
    "ctrl_mc_2": "true",
    "ctrl_mc_3": "false",
    "ctrl_mc_4": "true",
    "ctrl_mc_5": "false",
}

MC_MIN_ITEMS = 4
MC_FLAG_THRESHOLD = 0.8

# --- Covariate codings used by the confirmatory tests ------------------------

# Ordered, so the sign of an effect is readable (PREREGISTRATION §6.1).
AGE_CODES: dict[str, int] = {"18-35": 1, "36-50": 2, "51-65": 3, "66+": 4}

THEO_ORIENTATION_CODES: dict[str, int] = {
    "traditionaliste": 1,
    "modere": 2,
    "progressiste": 3,
}

# H6 is analysed on the respondents who report an official position only.
COMMUNITY_POSITION_CODES: dict[str, int] = {
    "oui_defavorable": 1,
    "oui_prudent": 2,
    "oui_favorable": 3,
}

FORMAL_THEOLOGICAL_TRAINING: tuple[str, ...] = ("diplome_theologie", "formation_pastorale")
NO_FORMAL_THEOLOGICAL_TRAINING: tuple[str, ...] = ("aucune", "cours_ponctuels")

CHARISMATIC = "charismatique"
NON_CHARISMATIC = "non_charismatique"


def item_ids_of(dimension: str, core_only: bool = False) -> Sequence[str]:
    specs = DIMENSION_ITEM_SPECS[dimension]
    return [s.item_id for s in specs if (s.core or not core_only)]
