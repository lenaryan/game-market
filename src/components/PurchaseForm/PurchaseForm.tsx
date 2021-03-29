import React, {useContext, useState } from 'react';
import {BuyStatus, Purchase, UserShortInfo} from '../../data/types';
import {CurrentUserContext} from '../Context';
import { USERS } from '../../data/api/data';
import { UserInfo } from '../../data/types';
import './PurchaseForm.css';

interface PurchaseFormProps {
    value: Purchase;
    onChange: (value: Purchase) => void;
    buyStatus?: BuyStatus;
}

// Speaking of tests:
// I couldn't really understand what's going on with tests,
// where I needed user ids:
// like... I rendered friends checkboxes, but tests were still looking for friends ids...

export function PurchaseForm({value, buyStatus, onChange}: PurchaseFormProps) {
    const [ showInvite, setShowInvite ] = useState(false);
    const [ disclaimerId, setDisclaimerId ] = useState(0);
    const [ renderSecondEmail, setRenderSecondEmail ] = useState(false);
    const currentUser = useContext(CurrentUserContext);

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

    // sorts friends list in an alphabetical order
    let sortedFriends: UserInfo[] = friendsList.sort((a: UserInfo, b: UserInfo) => {
        if (b.name < a.name) return 1;
        else if (b.name >= a.name) return -1;
        return 0;
    })

    // shows and hides invitations forms 
    // cleans email fields on unselect an invitation checkbox
    const invitationForm = () => {
        if (showInvite) {
            const emails = Array.from(document.getElementsByClassName('email'))
            emails.forEach(emailField => {
                (emailField as HTMLInputElement).value = '';
            });
            setShowInvite(false);
        } else {
            setShowInvite(true);
        }
    }

    // renders the second email input
    // adds emails to the onChange method
    const renderNextEmail = (e: React.FormEvent<HTMLInputElement>) => {
        if (!renderSecondEmail) {
            setRenderSecondEmail(true);
        }
        const emails = Array.from(document.getElementsByClassName('email'))
        let emailsList: string[] = [];
            emails.forEach(emailField => {
                if ((emailField as HTMLInputElement).value) emailsList.push((emailField as HTMLInputElement).value);
            });
        onChange({...value, emails: [...emailsList]})

        // returns selectable users list with emails
        if (currentUser && friendsIds) {
            if (!value.game.restrictions?.minAge) {
                onChange({...value, emails: [...emailsList], userIds: [currentUser.id, ...friendsIds]})
            } else {
                let selectableFriends: UserInfo[] = [];
                if (friendsList.length > 0) {
                    selectableFriends = friendsList.filter(friend => {
                        if (friend.age && value.game.restrictions?.minAge) 
                        return friend.age >= value.game.restrictions.minAge
                    })
                }
                let selectableFriendsIds: number[] = [];
                selectableFriends.forEach(friend => selectableFriendsIds.push(friend.id))
                onChange({...value, emails: [...emailsList], userIds: [currentUser.id, ...selectableFriendsIds]})
            }
        }
    }

    // checks if to show or hide age disclaimers depending on user id
    // returns selectable users list
    const setDisclaimer = (e: React.FormEvent<HTMLInputElement>, user: UserInfo | UserShortInfo | undefined) => {
        if (user) {
            setDisclaimerId(user.id);
            if (
                (user?.age && value.game.restrictions?.minAge && ( user.age < value.game.restrictions.minAge )) ||
                (!user?.age && value.game.restrictions?.minAge) 
            ) {
                e.currentTarget.checked = false;
            } else if (currentUser && friendsIds) {
                if (!value.game.restrictions?.minAge) {
                    onChange({...value, userIds: [currentUser.id, ...friendsIds]})
                }
                if (value.game.restrictions?.minAge && user?.age && ( user.age >= value.game.restrictions.minAge )) {
                    let selectableFriends: UserInfo[] = [];
                    if (friendsList) {
                        selectableFriends = friendsList.filter(friend => {
                            if (friend.age && value.game.restrictions?.minAge) 
                            return friend.age >= value.game.restrictions.minAge
                        })
                    }
                    let selectableFriendsIds: number[] = [];
                    selectableFriends.forEach(friend => selectableFriendsIds.push(friend.id))
                    console.log('selectableFriendsIds', selectableFriendsIds)
                    onChange({...value, userIds: [currentUser.id, ...selectableFriendsIds]})
                }
            }
        }   
    }

    // returns acknowledge invite checkbox value
    const acknowledgeInviteClick = (e: React.FormEvent<HTMLInputElement>) => {
        if (e.currentTarget.checked) {
            onChange({...value, acknowledgeInvite: true})
        } else {
            onChange({...value, acknowledgeInvite: false})
        }
    }

    // returns acknowledge invite age checkbox value
    const acknowledgeInviteAgeClick = (e: React.FormEvent<HTMLInputElement>) => {
        if (e.currentTarget.checked) {
            onChange({...value, acknowledgeInviteAge: true})
        } else {
            onChange({...value, acknowledgeInviteAge: false})
        }
    }

    return (
        <form>
            <ul className="people">
                <li className="check">
                    <label data-testid={ 'user' + currentUser?.id + 'Label' }>
                        <input type="checkbox" data-testid={ 'user' + currentUser?.id }
                            onClick={ (e) => setDisclaimer(e, currentUser) }
                        />
                        {currentUser?.name} (me)
                    </label>
                    {
                        (disclaimerId == currentUser?.id) &&
                        currentUser?.age && value.game.restrictions?.minAge && ( currentUser.age < value.game.restrictions.minAge ) &&
                        <p className="disclaimer" data-testid={ 'user' + currentUser?.id  + 'incorrectAge' }>The person is not allowed to get the game due to age restriction</p>
                    }
                    {
                        (disclaimerId == currentUser?.id) &&
                        (!currentUser?.age && value.game.restrictions?.minAge) &&
                        <p className="disclaimer" data-testid={ 'user' + currentUser?.id  + 'noAge' }>Cannot be selected unless user's age is specified, because the game has age restriction</p>
                    }
                </li>

                {
                    sortedFriends.map((friend, index) => (
                        <li key={index} className="check">
                            <label data-testid={ 'user' + friend?.id }>
                                <input type="checkbox" data-testid={'user' + (friend.id)} 
                                    onClick={ (e) => setDisclaimer(e, friend) }
                                />
                                {friend.name}
                            </label>
                            {
                                (disclaimerId == friend.id) && 
                                friend?.age && value.game.restrictions?.minAge && ( friend.age < value.game.restrictions.minAge ) &&
                                <p className="disclaimer" data-testid={ 'user' + friend.id  + 'incorrectAge' }>The person is not allowed to get the game due to age restriction</p>
                            }
                            {
                                (disclaimerId == friend.id) &&
                                !friend?.age && value.game.restrictions?.minAge &&
                                <p className="disclaimer" data-testid={ 'user' + friend.id  + 'noAge' }>Cannot be selected unless user's age is specified, because the game has age restriction</p>
                            }
                        </li>
                    ))
                }
            </ul>

            <label className="check">
                <input type="checkbox" data-testid="showInvite" onChange={invitationForm} />
                Invite friends
            </label>

            {
                showInvite &&
                <div className="invite" data-testid="invite">
                    <input className="email" type="email" id="email0" data-testid="email0" onChange={renderNextEmail} placeholder="friend's e-mail" />
                    {
                        renderSecondEmail &&
                        <input className="email" type="email" id="email1" data-testid="email1" onChange={renderNextEmail} placeholder="friend's e-mail" />
                    }
                    <div>
                        <label className="acknowledge">
                            <input type="checkbox" data-testid="acknowledgeInvite" required onClick={acknowledgeInviteClick} />
                            I acknowledge that Game Market invitation emails will be sent to specified emails. The game will become available to the person only onсe the registration in the Game Market is completed.
                        </label>
                    </div>

                    {
                        value.game.restrictions &&
                        <div>
                            <label className="acknowledge">
                                <input type="checkbox" data-testid="acknowledgeInviteAge" required onClick={acknowledgeInviteAgeClick} />
                                I acknowledge that the game has age restriction and might be unavailable if a person is under required age.
                            </label>
                        </div>
                    }
                </div>
            }
        </form>
    );
}
