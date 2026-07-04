import datetime

from sqlmodel import Session, select

from app.models import User


def generate_login_id(
    db: Session, first_name: str, last_name: str, joining_date: datetime.date
) -> str:
    """
    Generate a Login ID in the format:
    [Prefix (OI)][First 2 of First Name][First 2 of Last Name][Year][Serial]
    Example: OIJODO20220001
    """
    prefix = "OI"

    fn_part = first_name[:2].upper()
    if len(fn_part) < 2:
        fn_part = fn_part.ljust(2, "X")

    ln_part = last_name[:2].upper()
    if len(ln_part) < 2:
        ln_part = ln_part.ljust(2, "X")

    year = joining_date.year
    year_str = str(year)

    # Query to find the maximum serial for this specific prefix+name+year combo
    # Wait, the serial is per company/year. The requirement says:
    # "Serial Number of Joining for that Year"
    # So we need to count how many users joined in that year (globally or per company).
    # Since we might have multiple companies, let's count per year.

    # Let's count how many users joined this year overall to get a generic serial
    # Or count users created this year.

    start_of_year = datetime.date(year, 1, 1)
    end_of_year = datetime.date(year, 12, 31)

    statement = (
        select(User)
        .where(User.joining_date >= start_of_year)
        .where(User.joining_date <= end_of_year)
    )
    users_this_year = db.exec(statement).all()

    serial = len(users_this_year) + 1
    serial_str = f"{serial:04d}"

    return f"{prefix}{fn_part}{ln_part}{year_str}{serial_str}"
