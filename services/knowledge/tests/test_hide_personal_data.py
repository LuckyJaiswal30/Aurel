import pytest

from knowledge.privacy.hide_personal_data import hide_personal_data


@pytest.mark.parametrize(
    ("text", "placeholder"),
    [
        ("Contact mobile +91 98765 43210 for doubts", "[PHONE]"),
        ("Mail me at asha.v@example.com", "[EMAIL]"),
        ("Aadhaar: 2341 2341 2346", "[AADHAAR]"),
        ("PAN ABCPV1234K", "[PAN]"),
        ("Pay asha@okaxis on UPI", "[UPI]"),
        ("Bank account no 123456789012, IFSC SBIN0001234", "[BANK ACCOUNT]"),
        ("Name: Ravi Kumar", "[NAME]"),
    ],
)
def test_personal_details_are_hidden(text: str, placeholder: str) -> None:
    assert placeholder in hide_personal_data(text)


@pytest.mark.parametrize(
    "text",
    [
        "Alan Turing proposed the test in 1950. Russell and Norvig define rational agents.",
        "The router at 192.168.1.1 forwards packets. Learning rate 0.01, 9 Yes and 5 No.",
        "Entropy is 0.940 and the information gain of Outlook is 0.246.",
    ],
)
def test_study_content_is_left_alone(text: str) -> None:
    assert hide_personal_data(text) == text


@pytest.mark.parametrize(
    "text",
    [
        "Isaac Newton named the unit of force. The control system responds.",
        "Sir C. V. Raman's IP address example uses contact force of 25 N.",
        "Take into account 123456789012 photons in the current experiment.",
    ],
)
def test_names_and_numbers_in_ordinary_study_text_stay(text: str) -> None:
    assert hide_personal_data(text) == text
