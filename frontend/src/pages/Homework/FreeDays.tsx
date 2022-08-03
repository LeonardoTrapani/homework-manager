import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { freeDay } from '../../store/create-homework-slice';
import styles from './Homework.module.css';
import { useAppSelector } from '../../utilities/hooks';
import { AiOutlineCalendar } from 'react-icons/ai';

export const FreeDays: React.FC<{
  freeDays: freeDay[];
}> = ({ freeDays }) => {
  const isLoading = useAppSelector((state) => state.createHomework.isLoading);
  const { page } = useParams();
  const createHomeworkLoading = useAppSelector(
    (state) => state.createHomework.isLoading
  );
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const homeworkPage = page as string;
  const freeDaysJsx = freeDays.map((freeDay) => {
    return (
      <FreeDay
        date={freeDay.date}
        freeTime={freeDay.freeMinutes}
        key={freeDay.date}
        assignedTime={freeDay.assignedTime}
      />
    );
  });

  return (
    <div className={styles['free-days--container']}>
      {createHomeworkLoading && <div>Loading...</div>}
      {!createHomeworkLoading && (
        <>
          {freeDaysJsx.length ? (
            <div className={styles['free-days']}>{freeDaysJsx}</div>
          ) : (
            <h2>Found no homework</h2>
          )}
          <button
            onClick={() => {
              navigate('/create-homework/free-days/' + (+homeworkPage - 1));
            }}
          >
            PREVIOUS PAGE
          </button>
          <button
            onClick={() => {
              navigate('/create-homework/free-days/' + (+homeworkPage + 1));
            }}
          >
            NEXT PAGE
          </button>
        </>
      )}
    </div>
  );
};

export const FreeDay: React.FC<{
  date: string;
  freeTime: number;
  assignedTime: number;
}> = (props) => {
  const formattedDate = new Date(props.date).toDateString();
  return (
    <div className={styles['free-day']}>
      <FreeDayDate formattedDate={formattedDate} />
      <FreeDayMinutes freeTime={props.freeTime} />
      <AssignTime timeAssigned={props.assignedTime} />
      {/* Slider */}
    </div>
  );
};

const FreeDayDate: React.FC<{ formattedDate: string }> = ({
  formattedDate,
}) => {
  return (
    <div className={styles['free-day--date']}>
      <h2>{formattedDate}</h2>
      <AiOutlineCalendar size='24' />
    </div>
  );
};

const FreeDayMinutes: React.FC<{ freeTime: number }> = (props) => {
  return (
    <div className={styles['free-day--space-content']}>
      <p>Free minutes: </p>
      <p>{props.freeTime}</p>
    </div>
  );
};

const AssignTime: React.FC<{
  timeAssigned: number;
}> = (props) => {
  return (
    <div className={styles['free-day--space-content']}>
      <p>Assigned Time: </p>
      <p>{props.timeAssigned}</p>
    </div>
  );
};

export default FreeDays;
