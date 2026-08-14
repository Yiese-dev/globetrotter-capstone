from app.services.recommendation_service import jaccard_score


def test_no_overlap_scores_zero():
    assert jaccard_score({"nature"}, {"dining"}) == 0.0


def test_full_overlap_scores_one():
    assert jaccard_score({"nature", "hiking"}, {"nature", "hiking"}) == 1.0


def test_partial_overlap():
    assert jaccard_score({"nature", "hiking"}, {"nature", "dining"}) == 1 / 3


def test_empty_sets_score_zero():
    assert jaccard_score(set(), {"nature"}) == 0.0
    assert jaccard_score({"nature"}, set()) == 0.0
