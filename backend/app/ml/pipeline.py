from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression


CATEGORICAL_FEATURES = ["category", "location", "severity"]
NUMERICAL_FEATURES = ["submission_hour", "submission_day_of_week"]


def create_preprocessor() -> ColumnTransformer:
    """Create feature preprocessor using OneHotEncoder with handle_unknown='ignore'."""
    return ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES,
            ),
            (
                "num",
                StandardScaler(),
                NUMERICAL_FEATURES,
            ),
        ],
        remainder="drop",
    )


def build_pipeline(model_type: str = "random_forest", random_state: int = 42) -> Pipeline:
    """Build complete scikit-learn training pipeline."""
    preprocessor = create_preprocessor()

    if model_type == "linear":
        regressor = LinearRegression()
    elif model_type == "decision_tree":
        regressor = DecisionTreeRegressor(random_state=random_state, max_depth=8, min_samples_split=5)
    elif model_type == "random_forest":
        regressor = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=4,
            random_state=random_state,
            n_jobs=-1,
        )
    else:
        raise ValueError(f"Unknown model_type: {model_type}")

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor),
        ]
    )

