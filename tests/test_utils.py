import datetime

from app.core.utils import generate_login_id
from app.models import Company, User, UserRole


def test_generate_login_id_basic(session):
    # Setup test company
    company = Company(company_name="Test Co")
    session.add(company)
    session.commit()

    # Test generation for John Doe
    join_date = datetime.date(2022, 5, 10)
    login_id = generate_login_id(session, "John", "Doe", join_date)

    assert login_id == "OIJODO20220001"


def test_generate_login_id_increment(session):
    company = Company(company_name="Test Co")
    session.add(company)
    session.commit()

    join_date = datetime.date(2023, 1, 15)

    # Add a user joined in 2023
    user1 = User(
        company_id=company.id,
        role=UserRole.EMPLOYEE,
        first_name="Alice",
        last_name="Smith",
        email="alice@test.com",
        login_id="OIALSM20230001",
        password_hash="hash",
        joining_date=join_date,
    )
    session.add(user1)
    session.commit()

    # Generate for second user in same year
    login_id2 = generate_login_id(session, "Bob", "Jones", join_date)
    assert login_id2 == "OIBOJO20230002"


def test_generate_login_id_short_names(session):
    company = Company(company_name="Test Co")
    session.add(company)
    session.commit()

    join_date = datetime.date(2024, 8, 20)

    # Test names shorter than 2 characters
    login_id = generate_login_id(session, "A", "B", join_date)
    assert login_id == "OIAXBX20240001"
