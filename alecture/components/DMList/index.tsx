import { CollapseButton } from '@components/DMList/styles';
// import useSocket from '@hooks/useSocket';
import { IUser, IUserWithOnline } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import useSWR from 'swr';

interface Props {
  userData?: IUser;
}

const DMList: FC<Props> = () => {
  // router의 workspace 이름 가져오는 부분
  const { workspace } = useParams<{ workspace?: string }>();

  const {
    data: userData,
    error,
    revalidate,
    mutate,
  } = useSWR<IUser>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });

  // workspace 참여 멤버들 불러오기
  // online인 유저들
  const { data: memberData } = useSWR<IUserWithOnline[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher,
  );
  // const [socket] = useSocket(workspace);
  // true면 멤버목록 숨기기, false면 보이기
  const [channelCollapse, setChannelCollapse] = useState(false);
  const [onlineList, setOnlineList] = useState<number[]>([]);

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  useEffect(() => {
    console.log('DMList: workspace 바꼈다', workspace);
    setOnlineList([]);
  }, [workspace]);

  // useEffect(() => {
  //   socket?.on('onlineList', (data: number[]) => {
  //     setOnlineList(data);
  //   });
  //   // socket?.on('dm', onMessage);
  //   // console.log('socket on dm', socket?.hasListeners('dm'), socket);
  //   return () => {
  //     // socket?.off('dm', onMessage);
  //     // console.log('socket off dm', socket?.hasListeners('dm'));
  //     socket?.off('onlineList');
  //   };
  // }, [socket]);

  return (
    <>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Direct Messages</span>
      </h2>
      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.includes(member.id);
            return (
              // NavLink가 자동으로 selected calssName을 부여해 줌
              <NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`}>
                <i
                  // DM 아이디 점 들의 대한 icon className, 로그인 한 사용자는 초록불이 들어옴
                  className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                    isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
                  }`}
                  aria-hidden="true"
                  data-qa="presence_indicator"
                  data-qa-presence-self="false"
                  data-qa-presence-active="false"
                  data-qa-presence-dnd="false"
                />
                <span>{member.nickname}</span>
                {member.id === userData?.id && <span> (Me)</span>}
              </NavLink>
            );
          })}
      </div>
    </>
  );
};

export default DMList;