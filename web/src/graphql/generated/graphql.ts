/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Bookmark = {
  __typename?: 'Bookmark';
  _id: Scalars['String'];
  favorite: Scalars['Boolean'];
  icon: Scalars['String'];
  listId: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
  userId: Scalars['String'];
};

export type BookmarkInput = {
  icon: Scalars['String'];
  listId: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
};

export type BookmarkList = {
  __typename?: 'BookmarkList';
  _id: Scalars['String'];
  favorite: Scalars['Boolean'];
  public: Scalars['Boolean'];
  title: Scalars['String'];
  userId: Scalars['String'];
};

export type BookmarkListComplete = {
  __typename?: 'BookmarkListComplete';
  _id: Scalars['String'];
  children: Array<Bookmark>;
  favorite: Scalars['Boolean'];
  public: Scalars['Boolean'];
  title: Scalars['String'];
  userId: Scalars['String'];
};

export type MeResponse = {
  __typename?: 'MeResponse';
  bookmarkLists: Array<BookmarkListComplete>;
  error: Scalars['String'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  addBookmark?: Maybe<Scalars['Boolean']>;
  addBookmarkList?: Maybe<BookmarkList>;
};


export type MutationAddBookmarkArgs = {
  input: BookmarkInput;
};


export type MutationAddBookmarkListArgs = {
  title: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  bookmarks?: Maybe<Array<Bookmark>>;
  me?: Maybe<MeResponse>;
  user?: Maybe<User>;
};


export type QueryBookmarksArgs = {
  listId: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String'];
  email: Scalars['String'];
  img: Scalars['String'];
  name: Scalars['String'];
  tokenVersion: Scalars['Int'];
  username: Scalars['String'];
};

export type GetBookmarksQueryVariables = Exact<{
  listId: Scalars['String'];
}>;


export type GetBookmarksQuery = { __typename?: 'Query', bookmarks?: Array<{ __typename?: 'Bookmark', listId: string, _id: string, title: string, url: string, icon: string }> | null };


export const GetBookmarksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getBookmarks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bookmarks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"listId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listId"}},{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]} as unknown as DocumentNode<GetBookmarksQuery, GetBookmarksQueryVariables>;