import { useState, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Clock, ArrowRight, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const {
    employee,
    getEmployeeStatus,
    attendanceLogs,
    leaveRequests,
    teamMembers,
    payrollSlips,
    clockIn,
    clockOut
  } = useHRMS();

  const [time, setTime] = useState(new Date());
  const [clockMsg, setClockMsg] = useState({
    type: '',
    text: ''
  });

  useEffect(() => {
    const timer = setInterval(
      () => setTime(new Date()),
      1000
    );

    return () => clearInterval(timer);
  }, []);

  if (!employee) {
    return (
      <div className="p-6">
        Loading employee...
      </div>
    );
  }

  const today = new Date()
    .toISOString()
    .split('T')[0];

  const todayLog = attendanceLogs.find(
    log =>
      log.employeeId === employee.employee_id &&
      log.date === today
  );

  const isClockedIn =
    todayLog?.checkIn &&
    !todayLog?.checkOut;

  const isClockedOut =
    !!todayLog?.checkOut;

  const myLatestSlip = payrollSlips
    .filter(
      slip =>
        slip.employeeId === employee.employee_id
    )
    .sort((a, b) =>
      b.processedDate.localeCompare(
        a.processedDate
      )
    )[0];

  const approvedDays = leaveRequests
    .filter(
      req =>
        req.employeeId === employee.employee_id &&
        req.status === 'Approved'
    )
    .reduce((acc, curr) => {

      const days =
        Math.ceil(
          Math.abs(
            new Date(curr.endDate) -
            new Date(curr.startDate)
          ) /
          (1000 * 60 * 60 * 24)
        ) + 1;

      return acc + days;

    }, 0);

  const balances = [

    {
      name: 'Sick Leave',
      used: Math.min(
        approvedDays,
        10
      ),
      total: 10
    },

    {
      name: 'Casual Leave',
      used: 0,
      total: 8
    },

    {
      name: 'Paid Leave',
      used: 0,
      total: 15
    }

  ];

  const handleClockToggle = () => {

    setClockMsg({
      type: '',
      text: ''
    });

    if (!isClockedIn) {

      const res = clockIn();

      if (res?.success) {

        setClockMsg({

          type: 'success',

          text:
            `Checked in at ${res.log.checkIn}`

        });

      } else {

        setClockMsg({

          type: 'error',

          text: res?.message

        });

      }

    } else {

      const res = clockOut();

      if (res?.success) {

        setClockMsg({

          type: 'success',

          text:
            'Checked out successfully'

        });

      } else {

        setClockMsg({

          type: 'error',

          text: res?.message

        });

      }

    }

  };

  return (

    <div className="space-y-6 odoo-fade-in">

      {/* Header */}

      <div className="o-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div>

          <h2
            className="text-lg font-bold"
            style={{
              color:
                'var(--odoo-text)'
            }}
          >

            Welcome back,
            {' '}
            {employee.name}

          </h2>

          <p
            className="text-sm mt-0.5"
            style={{
              color:
                'var(--odoo-text-muted)'
            }}
          >

            {employee.jobTitle}

            {' · '}

            {employee.department}

          </p>

        </div>

        <span
          className="o-badge o-badge-purple"
        >

          {time.toLocaleDateString(

            undefined,

            {

              weekday: 'long',

              month: 'short',

              day: 'numeric'

            }

          )}

        </span>

      </div>

      {/* Clock Card */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div
          className="o-card p-6
          flex flex-col
          items-center"
        >

          <Clock
            className="h-8 w-8 mb-4"
          />

          <h2
            className="text-3xl font-bold"
          >

            {time.toLocaleTimeString()}

          </h2>

          <button

            onClick={
              handleClockToggle
            }

            disabled={
              isClockedOut
            }

            className="mt-5
            w-full py-2
            rounded"

          >

            {

              isClockedOut

                ? 'Completed'

                : isClockedIn

                ? 'Check Out'

                : 'Check In'

            }

          </button>

          {

            clockMsg.text && (

              <p
                className="mt-3"
              >

                {clockMsg.text}

              </p>

            )

          }

        </div>

        {/* Leave Card */}

        <div
          className="lg:col-span-2
          o-card p-5"
        >

          <div
            className="flex
            justify-between
            mb-4"
          >

            <h3>

              Leave Allocation

            </h3>

            <Link
              to="/leaves"
            >

              Request Leave

            </Link>

          </div>

          <div
            className="grid
            sm:grid-cols-3
            gap-4"
          >

            {

              balances.map(

                balance => {

                  const remaining =

                    balance.total -

                    balance.used;

                  const percent =

                    remaining *

                    100 /

                    balance.total;

                  return (

                    <div
                      key={
                        balance.name
                      }
                    >

                      <h4>

                        {balance.name}

                      </h4>

                      <p>

                        {

                          remaining

                        }

                        /

                        {

                          balance.total

                        }

                      </p>

                      <div>

                        <div

                          style={{

                            width:

                              `${percent}%`

                          }}

                        />

                      </div>

                    </div>

                  );

                }

              )

            }

          </div>

          {

            myLatestSlip && (

              <div
                className="mt-5"
              >

                <strong>

                  {

                    myLatestSlip.month

                  }

                </strong>

                {' - '}

                ₹

                {

                  myLatestSlip.net

                    .toLocaleString()

                }

              </div>

            )

          }

        </div>

      </div>

      {/* Team Section */}

      <div className="o-card p-5">

        <div
          className="flex
          justify-between
          mb-4"
        >

          <h3>

            Your Team

          </h3>

          <span>

            {

              teamMembers?.length ||

              0

            }

            {' '}
            colleagues

          </span>

        </div>

        <div className="emp-grid">

          {

            (teamMembers

              ?.filter(Boolean)

              || [])

            .map(member => {

              const status =

                member.employee_id

                  ? getEmployeeStatus(

                      member.employee_id

                    )

                  : 'absent';

              return (

                <Link

                  key={member.id}

                  to={`/profile/${member.employee_id}`}

                  className="emp-card"

                >

                  <div
                    className="absolute
                    top-3 right-3"
                  >

                    {

                      status ===

                        'present'

                      &&

                      <span

                        className="status-dot
                        status-dot--present"

                      />

                    }

                    {

                      status ===

                        'leave'

                      &&

                      <span

                        className="status-dot
                        status-dot--leave"

                      >

                        <Plane
                          className="h-2.5 w-2.5"
                        />

                      </span>

                    }

                    {

                      status ===

                        'absent'

                      &&

                      <span

                        className="status-dot
                        status-dot--absent"

                      />

                    }

                  </div>

                  {

                    member.profile_picture_url

                    ? (

                      <img

                        src={
                          member.profile_picture_url
                        }

                        alt={
                          member.name
                        }

                        className="emp-card-avatar"

                      />

                    )

                    : (

                      <div

                        className="emp-card-avatar-fallback"

                      >

                        {

                          member.name

                            ?.charAt(0)

                        }

                      </div>

                    )

                  }

                  <div>

                    <p>

                      {

                        member.name

                      }

                    </p>

                    <p>

                      {

                        member.job_title ||

                        member.department

                      }

                    </p>

                  </div>

                </Link>

              );

            })

          }

        </div>

      </div>

    </div>

  );
}