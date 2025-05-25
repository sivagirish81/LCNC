from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    face_encoding = Column(String, nullable=False)  # Stored as string representation of numpy array
    is_active = Column(Boolean, default=True)

class Room(Base):
    __tablename__ = 'rooms'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    camera_id = Column(Integer, nullable=False)  # Webcam device ID

class UserRoomPermission(Base):
    __tablename__ = 'user_room_permissions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    room_id = Column(Integer, ForeignKey('rooms.id'))
    
    user = relationship("User")
    room = relationship("Room")

def init_db():
    engine = create_engine('sqlite:///room_security.db')
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()