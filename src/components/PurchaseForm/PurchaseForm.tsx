import React, {useContext, useState } from 'react';
import {BuyStatus, Purchase} from '../../data/types';
import {CurrentUserContext} from '../Context';
import { USERS, GAMES } from '../../data/api/data';
import { UserInfo } from '../../data/types';

interface PurchaseFormProps {
    value: Purchase;
    onChange: (value: Purchase) => void;
    buyStatus?: BuyStatus;
}

export function PurchaseForm({value, buyStatus, onChange}: PurchaseFormProps) {
    const [ showInvite, setShowInvite ] = useState(false);
    const currentUser = useContext(CurrentUserContext);
    const userId = `user${currentUser?.id}`;
    const userIdLabel = `user${currentUser?.id}Label`;
    const inviteRef = React.useRef<HTMLFormElement>(null);

    let friendsIds: number[] | undefined;
    let friendsList: UserInfo[] = [];

    USERS.forEach(user => {
        if (user.id == currentUser?.id) {
            friendsIds = user.friendIds;
        }
    })

    USERS.forEach(user => {
        if (friendsIds?.includes(user.id)) {
            friendsList.push(user);
        }
    })

    const invitationForm = (e: React.ChangeEvent<HTMLInputElement>) => {

        // shouldComponentUpdate?..

        if (showInvite) {
            setShowInvite(false);
            inviteRef.current?.reset();
        } else {
            setShowInvite(true);
        }
    }

    const renderNextEmail = (e: React.FormEvent<HTMLInputElement>) => {
        if (e.currentTarget.nextSibling?.nodeName !== 'INPUT') {

            // можно сгенерировать нормальный айдишник с порядковым номером

            const newInput = document.createElement("input");
            newInput.setAttribute('type', 'email');
            newInput.setAttribute('data-testid', 'email1');

            e.currentTarget.after(newInput);
        }
    }

    return (
        <div>
            <ul>
                <li>
                    <input type="checkbox" id={userId} data-testid={userId} />
                    <label id={userIdLabel} data-testid={userIdLabel} htmlFor={userId}>{currentUser?.name} (me)</label>
                </li>

                {
                    friendsList.map((friend, index) => (
                        <li key={index}>
                            <label>
                                <input type="checkbox" data-testid={'user' + (friend.id)} 
                                    { ...friend.age && value.game.restrictions?.minAge && (friend.age < value.game.restrictions?.minAge ) && 'disabled' } 
                                />
                                {friend.name}
                            </label>
                        </li>
                    ))
                }
            </ul>

            <label>
                <input type="checkbox" data-testid="showInvite" onChange={invitationForm} />
                Invite friends
            </label>

            {
                showInvite &&
                <form ref={inviteRef} className="invite" data-testid="invite">
                    <input type="email" id="email0" data-testid="email0" onChange={renderNextEmail} />
                    <div>
                        <input type="checkbox" id="acknowledgeInvite" data-testid="acknowledgeInvite" />
                        <label htmlFor="acknowledgeInvite">I acknowledge that Game Market invitation emails will be sent to specified emails. The game will become available to the person only onсe the registration in the Game Market is completed.</label>
                    </div>

                    {
                        value.game.restrictions &&
                        <div>
                            <input type="checkbox" id="acknowledgeInviteAge" data-testid="acknowledgeInviteAge" />
                            <label htmlFor="acknowledgeInviteAge">I acknowledge that the game has age restriction and might be unavailable if a person is under required age.</label>
                        </div>
                    }
                </form>
            }
        </div>
    );
}
